import type {
  ConnectedAccount,
  PlatformCapabilities,
  PublishInput,
  PublishResult,
  SocialPublisher,
  StatusResult,
  ValidationResult,
} from "../contract";

/**
 * YouTube adapter — official Data API v3 resumable upload.
 *
 * Uses only documented endpoints:
 * - POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable
 * - PUT  <session url>  (streamed body)
 * - GET  https://www.googleapis.com/youtube/v3/videos (processing status)
 * - POST https://oauth2.googleapis.com/token (refresh)
 *
 * NOTE: uploads from unverified API projects are locked private until the
 * project passes Google's audit — surfaced in the admin UI, not hidden.
 */

const UPLOAD_ENDPOINT =
  "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";

export const youtubePublisher: SocialPublisher = {
  platform: "YOUTUBE",

  capabilities(): PlatformCapabilities {
    return {
      video: true,
      image: false,
      textOnly: false,
      statusPolling: true,
      nativeScheduling: true,
      maxCaptionLength: 5000,
      maxVideoDurationSeconds: 12 * 60 * 60,
      maxVideoBytes: 256 * 1024 * 1024 * 1024,
    };
  },

  async validate(input: PublishInput): Promise<ValidationResult> {
    if (!input.media || input.media.kind !== "video") {
      return { ok: false, reason: "YouTube requires a video file." };
    }
    if (!input.title.trim()) {
      return { ok: false, reason: "YouTube requires a title." };
    }
    if (input.title.length > 100) {
      return { ok: false, reason: "YouTube titles are limited to 100 characters." };
    }
    if (input.caption.length > 5000) {
      return { ok: false, reason: "YouTube descriptions are limited to 5000 characters." };
    }
    if (!input.account.scopes.some((scope) => scope.includes("youtube"))) {
      return { ok: false, reason: "The connected Google account is missing the YouTube upload scope." };
    }
    return { ok: true };
  },

  async publish(input: PublishInput): Promise<PublishResult> {
    if (!input.media) return { status: "FAILED", reason: "No media attached.", retryable: false };

    // 1. Open a resumable session.
    const sessionResponse = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.account.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": input.media.contentType,
        ...(input.media.sizeBytes
          ? { "X-Upload-Content-Length": String(input.media.sizeBytes) }
          : {}),
      },
      body: JSON.stringify({
        snippet: {
          title: input.title.slice(0, 100),
          description: input.caption.slice(0, 5000),
          categoryId: "10", // Music
        },
        status: { privacyStatus: "public", selfDeclaredMadeForKids: false },
      }),
    });

    if (sessionResponse.status === 401) {
      return { status: "FAILED", reason: "YouTube authorisation expired — reconnect the account.", retryable: false };
    }
    if (!sessionResponse.ok) {
      return {
        status: "FAILED",
        reason: `YouTube rejected the upload request (HTTP ${sessionResponse.status}).`,
        retryable: sessionResponse.status >= 500 || sessionResponse.status === 429,
      };
    }

    const sessionUrl = sessionResponse.headers.get("location");
    if (!sessionUrl) {
      return { status: "FAILED", reason: "YouTube did not return an upload session.", retryable: true };
    }

    // 2. Stream the media into the session.
    const stream = await input.media.openStream();
    const uploadResponse = await fetch(sessionUrl, {
      method: "PUT",
      headers: {
        "Content-Type": input.media.contentType,
        ...(input.media.sizeBytes ? { "Content-Length": String(input.media.sizeBytes) } : {}),
      },
      body: stream as ReadableStream<Uint8Array>,
      // Node fetch requires duplex for streamed bodies.
      // @ts-expect-error -- undici extension not yet in lib.dom types
      duplex: "half",
    });

    if (!uploadResponse.ok) {
      return {
        status: "FAILED",
        reason: `YouTube upload failed (HTTP ${uploadResponse.status}).`,
        retryable: uploadResponse.status >= 500 || uploadResponse.status === 429,
      };
    }

    const body = (await uploadResponse.json()) as {
      id?: string;
      status?: { uploadStatus?: string };
    };
    if (!body.id) {
      return { status: "FAILED", reason: "YouTube did not return a video id.", retryable: true };
    }

    // YouTube always post-processes; report PROCESSING and poll.
    return { status: "PROCESSING", externalId: body.id };
  },

  async getStatus(account: ConnectedAccount, externalId: string): Promise<StatusResult> {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "status,processingDetails");
    url.searchParams.set("id", externalId);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${account.accessToken}` },
    });
    if (!response.ok) return { status: "PROCESSING" };

    const body = (await response.json()) as {
      items?: {
        status?: { uploadStatus?: string; failureReason?: string };
        processingDetails?: { processingStatus?: string };
      }[];
    };
    const item = body.items?.[0];
    if (!item) return { status: "FAILED", reason: "The video no longer exists on YouTube." };

    if (item.status?.uploadStatus === "failed" || item.status?.uploadStatus === "rejected") {
      return {
        status: "FAILED",
        reason: `YouTube reported: ${item.status.failureReason ?? item.status.uploadStatus}.`,
      };
    }
    if (item.processingDetails?.processingStatus === "processing") {
      return { status: "PROCESSING" };
    }
    return { status: "PUBLISHED", externalUrl: `https://www.youtube.com/watch?v=${externalId}` };
  },

  async refreshCredentials(refreshToken: string) {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials are not configured.");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!response.ok) throw new Error(`Google token refresh failed (HTTP ${response.status}).`);

    const body = (await response.json()) as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    };
    return {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      expiresInSeconds: body.expires_in,
    };
  },
};
