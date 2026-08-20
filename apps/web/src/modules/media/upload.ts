import { z } from "zod";

/**
 * Upload constraints, shared by the client (for immediate feedback) and the
 * server (as the trust boundary).
 *
 * Extension AND declared MIME type must both match a single allowed kind —
 * a mismatch (e.g. `.mp4` with `image/png`) is rejected outright.
 */

export type UploadKind = "image" | "video" | "audio";

export const uploadRules: Record<
  UploadKind,
  { extensions: readonly string[]; mimeTypes: readonly string[]; maxBytes: number }
> = {
  image: {
    extensions: ["jpg", "jpeg", "png", "webp", "avif"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    maxBytes: 25 * 1024 * 1024, // 25MB
  },
  video: {
    extensions: ["mp4", "mov", "webm"],
    mimeTypes: ["video/mp4", "video/quicktime", "video/webm"],
    maxBytes: 8 * 1024 * 1024 * 1024, // 8GB
  },
  audio: {
    extensions: ["mp3", "wav", "m4a", "flac"],
    mimeTypes: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/flac"],
    maxBytes: 500 * 1024 * 1024, // 500MB
  },
};

export function detectKind(fileName: string, mimeType: string): UploadKind | null {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  for (const [kind, rules] of Object.entries(uploadRules) as [
    UploadKind,
    (typeof uploadRules)[UploadKind],
  ][]) {
    if (rules.extensions.includes(extension) && rules.mimeTypes.includes(mimeType)) {
      return kind;
    }
  }
  return null;
}

export const uploadSessionRequestSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(256)
    // Reject path tricks before the name is ever used to build a key.
    .refine((name) => !/[/\\]|\.\./.test(name), "Invalid file name."),
  mimeType: z.string().trim().min(3).max(128),
  sizeBytes: z.number().int().positive(),
  title: z.string().trim().min(1).max(200),
  altText: z.string().trim().max(500).default(""),
});

export type UploadSessionRequest = z.infer<typeof uploadSessionRequestSchema>;

export const confirmUploadSchema = z.object({
  mediaId: z.string().uuid(),
});

/** 8MB blocks: small enough to retry cheaply, large enough for throughput. */
export const UPLOAD_BLOCK_SIZE = 8 * 1024 * 1024;
