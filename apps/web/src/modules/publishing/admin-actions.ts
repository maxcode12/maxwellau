"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PUBLISHING_QUEUE, createQueue, queueConfigured } from "@maxwellau/azure/queue";
import { getPublisher } from "@maxwellau/social";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";
import type { ActionResult } from "@/components/admin/primitives";

const composerSchema = z
  .object({
    title: z.string().trim().min(2, "A title is required.").max(200),
    description: z.string().trim().max(5000).default(""),
    mediaId: z.string().uuid().optional().or(z.literal("")),
    publishToWebsite: z.boolean(),
    accountIds: z.array(z.string().uuid()).max(10),
    /** Optional per-destination caption override, keyed by account id. */
    captionOverrides: z.record(z.string().uuid(), z.string().trim().max(5000)).default({}),
    mode: z.enum(["now", "schedule"]),
    scheduledFor: z.string().optional().or(z.literal("")),
  })
  .refine((input) => input.publishToWebsite || input.accountIds.length > 0, {
    message: "Choose at least one destination.",
    path: ["accountIds"],
  })
  .refine(
    (input) =>
      input.mode === "now" ||
      (input.scheduledFor && Date.parse(input.scheduledFor) > Date.now()),
    { message: "Choose a future date and time.", path: ["scheduledFor"] },
  );

export type ComposerInput = z.input<typeof composerSchema>;

export async function createPostAction(input: unknown): Promise<ActionResult> {
  const user = await currentUserOrNull();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again." };

  const parsed = composerSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { status: "error", message: first?.message ?? "Invalid post." };
  }
  const data = parsed.data;

  // Load and validate referenced entities up front.
  const media = data.mediaId
    ? await db.media.findFirst({ where: { id: data.mediaId, status: "READY" } })
    : null;
  if (data.mediaId && !media) {
    return { status: "error", message: "The selected media is not ready or no longer exists." };
  }

  const accounts = await db.socialAccount.findMany({
    where: { id: { in: data.accountIds }, status: "CONNECTED" },
  });
  if (accounts.length !== data.accountIds.length) {
    return { status: "error", message: "One of the selected accounts is no longer connected." };
  }

  // Platform capability pre-checks so obviously-impossible destinations fail
  // at compose time with a clear message, not in the queue.
  for (const account of accounts) {
    const capabilities = getPublisher(account.platform).capabilities();
    if (media?.type === "VIDEO" && !capabilities.video) {
      return { status: "error", message: `${account.displayName} cannot receive video posts.` };
    }
    if (media?.type === "IMAGE" && !capabilities.image) {
      return { status: "error", message: `${account.displayName} cannot receive image posts.` };
    }
    if (!media && !capabilities.textOnly) {
      return { status: "error", message: `${account.displayName} requires a media file.` };
    }
  }

  const scheduled = data.mode === "schedule";
  const scheduledFor = scheduled ? new Date(data.scheduledFor!) : null;

  const post = await db.socialPost.create({
    data: {
      title: data.title,
      description: data.description,
      mediaId: media?.id ?? null,
      publishToWebsite: data.publishToWebsite,
      status: scheduled ? "SCHEDULED" : "PUBLISHING",
      scheduledFor,
      createdById: user.id,
      publications: {
        create: accounts.map((account) => ({
          accountId: account.id,
          status: "DRAFT",
          captionOverride: data.captionOverrides[account.id]?.trim() || null,
        })),
      },
    },
    include: { publications: true },
  });

  // Website destination is first-class and synchronous: it can never be
  // rolled back by a social failure.
  if (data.publishToWebsite && media?.type === "VIDEO" && !scheduled) {
    await publishVideoToWebsite(post.id);
  }

  if (!scheduled) {
    if (!queueConfigured()) {
      return {
        status: "error",
        message:
          "The publishing queue is not configured — social destinations were saved as drafts. Start Azurite or configure Azure Storage, then retry them.",
      };
    }
    const queue = createQueue(PUBLISHING_QUEUE);
    for (const publication of post.publications) {
      const attempt = publication.attempt + 1;
      await db.socialPublication.update({
        where: { id: publication.id },
        data: { status: "QUEUED", attempt, queuedAt: new Date() },
      });
      await queue.send({ kind: "publish", publicationId: publication.id, attempt });
    }
    if (post.publications.length === 0) {
      await db.socialPost.update({ where: { id: post.id }, data: { status: "COMPLETED" } });
    }
  }

  await recordAudit({
    actorId: user.id,
    action: scheduled ? "post.scheduled" : "post.published",
    entityType: "SocialPost",
    entityId: post.id,
    detail: { destinations: accounts.map((account) => account.platform) },
  });

  revalidatePath("/admin/publishing");
  return { status: "success", message: scheduled ? "Post scheduled." : "Post queued for publishing." };
}

async function publishVideoToWebsite(postId: string): Promise<void> {
  const post = await db.socialPost.findUnique({
    where: { id: postId },
    include: { media: true },
  });
  if (!post?.media) return;

  const baseSlug = slugify(post.title) || `post-${Date.now().toString(36)}`;
  await db.video.upsert({
    where: { slug: baseSlug },
    update: {},
    create: {
      slug: baseSlug,
      title: post.title,
      description: post.description,
      category: "WORSHIP_SESSION",
      publishedAt: new Date(),
      sourceMediaId: post.media.id,
      visibility: "PUBLISHED",
    },
  });
  revalidatePath("/videos");
  revalidatePath("/");
}

export async function retryPublicationAction(formData: FormData): Promise<void> {
  const user = await currentUserOrNull();
  if (!user) return;

  const publicationId = String(formData.get("publicationId") ?? "");
  if (!publicationId) return;

  const publication = await db.socialPublication.findUnique({
    where: { id: publicationId },
    select: { id: true, status: true, attempt: true, postId: true },
  });
  if (!publication || publication.status !== "FAILED") return;
  if (!queueConfigured()) return;

  const attempt = publication.attempt + 1;
  await db.socialPublication.update({
    where: { id: publication.id },
    data: { status: "QUEUED", attempt, queuedAt: new Date(), lastError: null },
  });
  await db.socialPost.update({
    where: { id: publication.postId },
    data: { status: "PUBLISHING" },
  });
  await createQueue(PUBLISHING_QUEUE).send({
    kind: "publish",
    publicationId: publication.id,
    attempt,
  });

  await recordAudit({
    actorId: user.id,
    action: "publication.retried",
    entityType: "SocialPublication",
    entityId: publication.id,
    detail: { attempt },
  });

  revalidatePath("/admin/publishing");
}
