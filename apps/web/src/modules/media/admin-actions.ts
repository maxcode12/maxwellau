"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { blobStorage, blobStorageConfigured, type UploadSas } from "@/lib/azure/blob";
import { slugify } from "@/lib/utils";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";
import {
  confirmUploadSchema,
  detectKind,
  uploadRules,
  uploadSessionRequestSchema,
} from "@/modules/media/upload";

const MEDIA_CONTAINER = process.env.AZURE_STORAGE_CONTAINER_MEDIA ?? "media";

type UploadSessionResult =
  | {
      ok: true;
      mediaId: string;
      sas: UploadSas;
      blockSizeHint: number;
    }
  | { ok: false; message: string };

/**
 * Step 1 of the direct-upload flow (see CLAUDE.md "Media Workflow"):
 * authenticate, validate name/MIME/size, create a PENDING Media row and issue
 * a short-lived create/write-only SAS scoped to exactly one blob key.
 */
export async function requestUploadSessionAction(input: unknown): Promise<UploadSessionResult> {
  const user = await currentUserOrNull();
  if (!user) return { ok: false, message: "Your session has expired. Sign in again." };

  if (!blobStorageConfigured()) {
    return {
      ok: false,
      message:
        "Media storage is not configured in this environment. Start the local Azurite container (docker compose up -d azurite) or set AZURE_STORAGE_ACCOUNT.",
    };
  }

  const parsed = uploadSessionRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid upload request." };
  const request = parsed.data;

  const kind = detectKind(request.fileName, request.mimeType);
  if (!kind) {
    return {
      ok: false,
      message: "That file type is not supported. Upload an image, video or audio file.",
    };
  }

  const rules = uploadRules[kind];
  if (request.sizeBytes > rules.maxBytes) {
    const maxMb = Math.round(rules.maxBytes / (1024 * 1024));
    return { ok: false, message: `That file is too large — the limit is ${maxMb}MB.` };
  }

  // Collision-resistant, non-guessable key. The original file name is kept in
  // metadata but never trusted for the storage path.
  const extension = request.fileName.split(".").pop()!.toLowerCase();
  const blobKey = `${kind}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}/${slugify(
    request.fileName.replace(/\.[^.]+$/, ""),
  )}.${extension}`;

  const media = await db.media.create({
    data: {
      type: kind === "image" ? "IMAGE" : kind === "video" ? "VIDEO" : "AUDIO",
      status: "PENDING",
      title: request.title,
      altText: request.altText,
      container: MEDIA_CONTAINER,
      blobKey,
      contentType: request.mimeType,
      sizeBytes: BigInt(request.sizeBytes),
      uploadedById: user.id,
    },
    select: { id: true },
  });

  const sas = await blobStorage().issueUploadSas(MEDIA_CONTAINER, blobKey);

  return {
    ok: true,
    mediaId: media.id,
    sas,
    blockSizeHint: 8 * 1024 * 1024,
  };
}

type ConfirmResult = { ok: true } | { ok: false; message: string };

/**
 * Step 2: after the browser finishes uploading, verify the blob actually
 * exists with the expected size, then mark the Media record READY.
 */
export async function confirmUploadAction(input: unknown): Promise<ConfirmResult> {
  const user = await currentUserOrNull();
  if (!user) return { ok: false, message: "Your session has expired. Sign in again." };

  const parsed = confirmUploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid confirmation." };

  const media = await db.media.findUnique({ where: { id: parsed.data.mediaId } });
  if (!media) return { ok: false, message: "Unknown upload." };
  if (media.status === "READY") return { ok: true };

  const head = await blobStorage().headBlob(media.container, media.blobKey);
  if (!head.exists) {
    return { ok: false, message: "The uploaded file could not be found. Try the upload again." };
  }

  const expected = media.sizeBytes ? Number(media.sizeBytes) : undefined;
  if (expected !== undefined && head.contentLength !== undefined && head.contentLength !== expected) {
    return {
      ok: false,
      message: "The uploaded file is incomplete. Retry the upload.",
    };
  }

  await db.media.update({
    where: { id: media.id },
    data: { status: "READY", sizeBytes: head.contentLength ? BigInt(head.contentLength) : media.sizeBytes },
  });

  await recordAudit({
    actorId: user.id,
    action: "media.uploaded",
    entityType: "Media",
    entityId: media.id,
    detail: { container: media.container, type: media.type },
  });

  revalidatePath("/admin/media");
  return { ok: true };
}

export async function archiveMediaAction(formData: FormData): Promise<void> {
  const user = await currentUserOrNull();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Soft delete — the blob stays in storage (lifecycle rules cool/archive it).
  await db.media.update({
    where: { id },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });

  await recordAudit({
    actorId: user.id,
    action: "media.archived",
    entityType: "Media",
    entityId: id,
  });

  revalidatePath("/admin/media");
}
