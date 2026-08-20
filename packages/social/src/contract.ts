import { z } from "zod";

/**
 * The application-level contract every social platform adapter implements.
 *
 * Platforms differ wildly in what they support; the contract therefore models
 * CAPABILITIES explicitly rather than pretending every destination can do
 * everything. UI and worker consult `capabilities()` before offering or
 * attempting an operation.
 */

export type SocialPlatformId = "YOUTUBE" | "FACEBOOK" | "INSTAGRAM" | "TIKTOK";

export type PlatformCapabilities = {
  /** Video files can be published. */
  readonly video: boolean;
  /** Image posts can be published. */
  readonly image: boolean;
  /** Text-only posts can be published. */
  readonly textOnly: boolean;
  /** The platform reports asynchronous processing status after submit. */
  readonly statusPolling: boolean;
  /** Platform-side scheduled publishing (vs. our own scheduler). */
  readonly nativeScheduling: boolean;
  /** Maximum caption/description length. */
  readonly maxCaptionLength: number;
  /** Maximum video duration in seconds, if constrained. */
  readonly maxVideoDurationSeconds: number | null;
  /** Maximum file size in bytes, if constrained. */
  readonly maxVideoBytes: number | null;
};

/** What the worker hands an adapter to publish. */
export type PublishInput = {
  readonly publicationId: string;
  readonly title: string;
  readonly caption: string;
  readonly media: {
    readonly kind: "video" | "image";
    readonly contentType: string;
    readonly sizeBytes: number | null;
    /** Called by the adapter to obtain a readable stream of the media (YouTube). */
    readonly openStream: () => Promise<ReadableStream<Uint8Array> | NodeJS.ReadableStream>;
    /**
     * Short-lived read-only URL for platforms that ingest by URL (Meta's
     * `file_url`/`video_url`, TikTok PULL_FROM_URL). Null when the storage
     * backend cannot mint one.
     */
    readonly readUrl: string | null;
  } | null;
  readonly account: ConnectedAccount;
};

export type ConnectedAccount = {
  readonly accountId: string;
  readonly platform: SocialPlatformId;
  readonly externalId: string;
  /** Decrypted access token. Never logged, never returned to a browser. */
  readonly accessToken: string;
  readonly scopes: readonly string[];
};

export type ValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string };

export type PublishResult =
  | {
      readonly status: "PUBLISHED";
      readonly externalId: string;
      readonly externalUrl: string | null;
    }
  | {
      /** Accepted by the platform but still processing; poll getStatus. */
      readonly status: "PROCESSING";
      readonly externalId: string;
    }
  | {
      readonly status: "FAILED";
      /** Sanitised, actionable message — never a raw provider payload. */
      readonly reason: string;
      /** Retrying may help (rate limit, transient) vs. permanent (policy). */
      readonly retryable: boolean;
    };

export type StatusResult =
  | { readonly status: "PROCESSING" }
  | { readonly status: "PUBLISHED"; readonly externalUrl: string | null }
  | { readonly status: "FAILED"; readonly reason: string };

export interface SocialPublisher {
  readonly platform: SocialPlatformId;
  capabilities(): PlatformCapabilities;
  /** Cheap pre-flight checks before a job is queued or run. */
  validate(input: PublishInput): Promise<ValidationResult>;
  publish(input: PublishInput): Promise<PublishResult>;
  /** Only meaningful when capabilities().statusPolling is true. */
  getStatus?(account: ConnectedAccount, externalId: string): Promise<StatusResult>;
  /** Exchange a refresh token for a new access token, when the platform supports it. */
  refreshCredentials?(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresInSeconds: number;
  }>;
}

/** Message enqueued for each destination of each post. */
export const publishJobSchema = z.object({
  kind: z.literal("publish"),
  publicationId: z.string().uuid(),
  /**
   * Idempotency key: publicationId + attempt. The worker refuses to act on a
   * job whose attempt does not match the row, so a redelivered message can
   * never double-post.
   */
  attempt: z.number().int().min(0),
});

export type PublishJob = z.infer<typeof publishJobSchema>;
