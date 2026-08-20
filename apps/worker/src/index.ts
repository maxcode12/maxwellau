import { PrismaClient } from "@prisma/client";
import { PUBLISHING_QUEUE, createQueue, queueConfigured } from "@maxwellau/azure/queue";
import {
  decryptToken,
  getPublisher,
  publishJobSchema,
  type ConnectedAccount,
  type PublishInput,
} from "@maxwellau/social";
import { mintReadUrl, openBlobStream } from "./blob-read.js";

/**
 * Maxwell AU publishing worker.
 *
 * Polls the Storage Queue for publish jobs, one destination per job. Each job
 * carries (publicationId, attempt) as an idempotency key: the worker only acts
 * when the database row is still QUEUED with the same attempt, so redelivered
 * or duplicated messages can never double-post. A destination failure only
 * marks THAT publication FAILED — siblings are untouched by design.
 */

const db = new PrismaClient();
const POLL_INTERVAL_MS = 10_000;
const VISIBILITY_SECONDS = 10 * 60;
const MAX_DELIVERIES = 5;

function log(event: string, detail: Record<string, unknown> = {}) {
  // Never log tokens, captions or media URLs — ids and statuses only.
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...detail }));
}

async function loadConnectedAccount(accountId: string): Promise<ConnectedAccount | null> {
  const account = await db.socialAccount.findUnique({ where: { id: accountId } });
  if (!account || account.status !== "CONNECTED" || !account.encryptedAccessToken) return null;

  let accessToken = decryptToken(account.encryptedAccessToken);

  // Refresh expired tokens where the platform supports it.
  if (
    account.accessTokenExpiresAt &&
    account.accessTokenExpiresAt.getTime() < Date.now() + 60_000 &&
    account.encryptedRefreshToken
  ) {
    const publisher = getPublisher(account.platform);
    if (publisher.refreshCredentials) {
      try {
        const { encryptToken } = await import("@maxwellau/social");
        const refreshed = await publisher.refreshCredentials(
          decryptToken(account.encryptedRefreshToken),
        );
        accessToken = refreshed.accessToken;
        await db.socialAccount.update({
          where: { id: account.id },
          data: {
            encryptedAccessToken: encryptToken(refreshed.accessToken),
            ...(refreshed.refreshToken
              ? { encryptedRefreshToken: encryptToken(refreshed.refreshToken) }
              : {}),
            accessTokenExpiresAt: new Date(Date.now() + refreshed.expiresInSeconds * 1000),
          },
        });
        log("worker.token_refreshed", { accountId: account.id, platform: account.platform });
      } catch {
        await db.socialAccount.update({
          where: { id: account.id },
          data: { status: "EXPIRED" },
        });
        return null;
      }
    }
  }

  return {
    accountId: account.id,
    platform: account.platform,
    externalId: account.externalId,
    accessToken,
    scopes: account.scopes,
  };
}

async function processJob(raw: unknown): Promise<void> {
  const parsed = publishJobSchema.safeParse(raw);
  if (!parsed.success) {
    log("worker.job_invalid");
    return;
  }
  const job = parsed.data;

  const publication = await db.socialPublication.findUnique({
    where: { id: job.publicationId },
    include: {
      post: { include: { media: true } },
      account: { select: { id: true, platform: true } },
    },
  });

  // Idempotency gate: only act on a QUEUED row with a matching attempt.
  if (!publication || publication.status !== "QUEUED" || publication.attempt !== job.attempt) {
    log("worker.job_skipped_idempotent", { publicationId: job.publicationId });
    return;
  }

  await db.socialPublication.update({
    where: { id: publication.id },
    data: { status: "PROCESSING" },
  });
  log("worker.publishing", {
    publicationId: publication.id,
    platform: publication.account.platform,
  });

  const fail = async (reason: string) => {
    await db.socialPublication.update({
      where: { id: publication.id },
      data: { status: "FAILED", lastError: reason.slice(0, 500) },
    });
    await settlePost(publication.postId);
    log("worker.publish_failed", { publicationId: publication.id });
  };

  const account = await loadConnectedAccount(publication.accountId);
  if (!account) {
    await fail("The social account is disconnected or its authorisation has expired.");
    return;
  }

  const publisher = getPublisher(account.platform);
  const media = publication.post.media;

  const input: PublishInput = {
    publicationId: publication.id,
    title: publication.post.title,
    caption: publication.captionOverride ?? publication.post.description,
    media: media
      ? {
          kind: media.type === "VIDEO" ? "video" : "image",
          contentType: media.contentType,
          sizeBytes: media.sizeBytes ? Number(media.sizeBytes) : null,
          openStream: () => openBlobStream(media.container, media.blobKey),
          readUrl: await mintReadUrl(media.container, media.blobKey),
        }
      : null,
    account,
  };

  const validation = await publisher.validate(input);
  if (!validation.ok) {
    await fail(validation.reason);
    return;
  }

  try {
    const result = await publisher.publish(input);

    if (result.status === "FAILED") {
      await fail(result.reason);
      return;
    }

    if (result.status === "PROCESSING") {
      await db.socialPublication.update({
        where: { id: publication.id },
        data: { status: "PROCESSING", externalId: result.externalId },
      });
      // Poll for a terminal state (bounded).
      if (publisher.getStatus) {
        for (let poll = 0; poll < 20; poll++) {
          await new Promise((resolve) => setTimeout(resolve, 15_000));
          const status = await publisher.getStatus(account, result.externalId);
          if (status.status === "PUBLISHED") {
            await db.socialPublication.update({
              where: { id: publication.id },
              data: {
                status: "PUBLISHED",
                externalUrl: status.externalUrl,
                publishedAt: new Date(),
                lastError: null,
              },
            });
            await settlePost(publication.postId);
            log("worker.published", { publicationId: publication.id });
            return;
          }
          if (status.status === "FAILED") {
            await fail(status.reason);
            return;
          }
        }
        // Still processing after the bounded poll — leave PROCESSING; a
        // scheduled status sweep or manual refresh resolves it later.
        log("worker.still_processing", { publicationId: publication.id });
        return;
      }
      return;
    }

    await db.socialPublication.update({
      where: { id: publication.id },
      data: {
        status: "PUBLISHED",
        externalId: result.externalId,
        externalUrl: result.externalUrl,
        publishedAt: new Date(),
        lastError: null,
      },
    });
    await settlePost(publication.postId);
    log("worker.published", { publicationId: publication.id });
  } catch (error) {
    await fail(
      error instanceof Error ? `Unexpected error: ${error.message}` : "Unexpected worker error.",
    );
  }
}

/** Roll the parent post status up from its destinations. */
async function settlePost(postId: string): Promise<void> {
  const publications = await db.socialPublication.findMany({
    where: { postId },
    select: { status: true },
  });
  const pending = publications.some(
    (publication) => publication.status === "QUEUED" || publication.status === "PROCESSING",
  );
  if (pending) return;

  const anyFailed = publications.some((publication) => publication.status === "FAILED");
  await db.socialPost.update({
    where: { id: postId },
    data: { status: anyFailed ? "COMPLETED_WITH_FAILURES" : "COMPLETED" },
  });
}

/** Promote due scheduled posts into queued jobs. */
async function promoteScheduledPosts(): Promise<void> {
  const due = await db.socialPost.findMany({
    where: { status: "SCHEDULED", scheduledFor: { lte: new Date() } },
    include: { publications: true },
  });
  if (due.length === 0) return;

  const queue = createQueue(PUBLISHING_QUEUE);
  for (const post of due) {
    await db.socialPost.update({ where: { id: post.id }, data: { status: "PUBLISHING" } });
    for (const publication of post.publications) {
      if (publication.status !== "DRAFT") continue;
      const attempt = publication.attempt + 1;
      await db.socialPublication.update({
        where: { id: publication.id },
        data: { status: "QUEUED", attempt, queuedAt: new Date() },
      });
      await queue.send({ kind: "publish", publicationId: publication.id, attempt });
    }
    log("worker.scheduled_post_promoted", { postId: post.id });
  }
}

async function main() {
  if (!queueConfigured()) {
    console.error(
      "Queue storage is not configured. Set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT.",
    );
    process.exit(1);
  }

  const queue = createQueue(PUBLISHING_QUEUE);
  log("worker.started", { queue: PUBLISHING_QUEUE });

  let running = true;
  process.on("SIGINT", () => (running = false));
  process.on("SIGTERM", () => (running = false));

  while (running) {
    try {
      await promoteScheduledPosts();

      const messages = await queue.receive(4, VISIBILITY_SECONDS);
      for (const message of messages) {
        if (message.dequeueCount > MAX_DELIVERIES) {
          // Poison message: record and drop.
          log("worker.poison_message_dropped", { messageId: message.id });
          await queue.delete(message);
          continue;
        }
        await processJob(message.body);
        await queue.delete(message);
      }

      if (messages.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    } catch (error) {
      log("worker.loop_error", {
        message: error instanceof Error ? error.message : "unknown",
      });
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }

  await db.$disconnect();
  log("worker.stopped");
}

await main();
