"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { parseForm } from "@/lib/form";
import { slugify } from "@/lib/utils";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";
import type { ActionResult } from "@/components/admin/primitives";

const videoFormSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(2, "Title is required.").max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only.")
    .max(96)
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(8000).default(""),
  category: z.enum(["WORSHIP_SESSION", "MUSIC_VIDEO", "LIVE", "KINGS_TIME", "BEHIND_THE_SCENES"]),
  publishedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Provide the publish date and time."),
  youtubeId: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{6,20}$/, "That does not look like a YouTube video id.")
    .optional()
    .or(z.literal("")),
  durationSeconds: z
    .string()
    .trim()
    .regex(/^\d*$/, "Duration in seconds.")
    .optional()
    .or(z.literal("")),
  featured: z
    .string()
    .optional()
    .transform((value) => value === "on"),
  visibility: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function saveVideoAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await currentUserOrNull();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again." };

  const parsed = parseForm(videoFormSchema, formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.message, fieldErrors: parsed.fieldErrors };
  }
  const input = parsed.data;

  const data = {
    title: input.title,
    slug: input.slug || slugify(input.title),
    description: input.description,
    category: input.category,
    publishedAt: new Date(`${input.publishedAt}:00.000Z`),
    youtubeId: input.youtubeId || null,
    durationSeconds: input.durationSeconds ? Number(input.durationSeconds) : null,
    featured: input.featured,
    visibility: input.visibility,
  };

  try {
    if (input.id) {
      await db.video.update({ where: { id: input.id }, data });
      await recordAudit({
        actorId: user.id,
        action: "video.updated",
        entityType: "Video",
        entityId: input.id,
        detail: { slug: data.slug },
      });
    } else {
      const created = await db.video.create({ data });
      await recordAudit({
        actorId: user.id,
        action: "video.created",
        entityType: "Video",
        entityId: created.id,
        detail: { slug: data.slug },
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "That slug is already in use.",
        fieldErrors: { slug: "Already in use — choose another." },
      };
    }
    throw error;
  }

  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  revalidatePath("/");
  return { status: "success", message: "Video saved." };
}
