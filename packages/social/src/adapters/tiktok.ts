import type {
  PlatformCapabilities,
  PublishInput,
  PublishResult,
  SocialPublisher,
  ValidationResult,
} from "../contract";

/**
 * TikTok adapter — official Content Posting API (PULL_FROM_URL).
 *
 * Capabilities depend heavily on the developer app's audit status:
 * unaudited apps can only create private/draft posts, and PULL_FROM_URL
 * requires the source domain to be verified in the TikTok developer console.
 * Both constraints are surfaced to the admin UI via capability detection and
 * clear failure reasons rather than silent degradation.
 */

const API = "https://open.tiktokapis.com/v2";

export const tiktokPublisher: SocialPublisher = {
  platform: "TIKTOK",

  capabilities(): PlatformCapabilities {
    return {
      video: true,
      image: false,
      textOnly: false,
      statusPolling: true,
      nativeScheduling: false,
      maxCaptionLength: 2200,
      maxVideoDurationSeconds: 10 * 60,
      maxVideoBytes: 4 * 1024 * 1024 * 1024,
    };
  },

  async validate(input: PublishInput): Promise<ValidationResult> {
    if (!input.media || input.media.kind !== "video") {
      return { ok: false, reason: "TikTok requires a video file." };
    }
    if (!input.media.readUrl) {
      return { ok: false, reason: "TikTok ingestion needs a readable media URL." };
    }
    if (input.caption.length > 2200) {
      return { ok: false, reason: "TikTok captions are limited to 2200 characters." };
    }
    return { ok: true };
  },

  async publish(input: PublishInput): Promise<PublishResult> {
    const title = [input.title, input.caption].filter(Boolean).join(" — ").slice(0, 2200);

    const response = await fetch(`${API}/post/publish/video/init/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.account.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title,
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: input.media!.readUrl,
        },
      }),
    });

    const body = (await response.json().catch(() => ({}))) as {
      data?: { publish_id?: string };
      error?: { code?: string; message?: string };
    };

    if (!response.ok || !body.data?.publish_id) {
      const code = body.error?.code ?? `http_${response.status}`;
      const domainIssue = code === "url_ownership_unverified";
      return {
        status: "FAILED",
        reason: domainIssue
          ? "TikTok requires the media domain to be verified in the developer console."
          : `TikTok rejected the post (${code}).`,
        retryable: !domainIssue && (response.status >= 500 || response.status === 429),
      };
    }

    return { status: "PROCESSING", externalId: body.data.publish_id };
  },

  async getStatus(account, externalId) {
    const response = await fetch(`${API}/post/publish/status/fetch/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ publish_id: externalId }),
    });
    if (!response.ok) return { status: "PROCESSING" };

    const body = (await response.json()) as {
      data?: { status?: string; fail_reason?: string };
    };
    const status = body.data?.status;
    if (status === "PUBLISH_COMPLETE") return { status: "PUBLISHED", externalUrl: null };
    if (status === "FAILED") {
      return {
        status: "FAILED",
        reason: `TikTok reported: ${body.data?.fail_reason ?? "unknown failure"}.`,
      };
    }
    return { status: "PROCESSING" };
  },

  async refreshCredentials(refreshToken: string) {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    if (!clientKey || !clientSecret) throw new Error("TikTok credentials are not configured.");

    const response = await fetch(`${API}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    if (!response.ok) throw new Error(`TikTok token refresh failed (HTTP ${response.status}).`);

    const body = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };
    return {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      expiresInSeconds: body.expires_in,
    };
  },
};
