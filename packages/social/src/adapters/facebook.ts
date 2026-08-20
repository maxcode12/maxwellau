import type {
  PlatformCapabilities,
  PublishInput,
  PublishResult,
  SocialPublisher,
  ValidationResult,
} from "../contract";

/**
 * Facebook Page adapter — official Graph API.
 *
 * Videos are ingested by URL (`file_url`) from a short-lived read-only SAS,
 * which is the documented server-side path that avoids proxying large files.
 * Requires a PAGE access token with pages_manage_posts / pages_read_engagement
 * (granted via the Meta app's OAuth flow and app review).
 */

const GRAPH = "https://graph.facebook.com/v21.0";

export const facebookPublisher: SocialPublisher = {
  platform: "FACEBOOK",

  capabilities(): PlatformCapabilities {
    return {
      video: true,
      image: true,
      textOnly: true,
      statusPolling: true,
      nativeScheduling: true,
      maxCaptionLength: 63_206,
      maxVideoDurationSeconds: 4 * 60 * 60,
      maxVideoBytes: 10 * 1024 * 1024 * 1024,
    };
  },

  async validate(input: PublishInput): Promise<ValidationResult> {
    if (input.media && !input.media.readUrl) {
      return { ok: false, reason: "Facebook ingestion needs a readable media URL." };
    }
    if (!input.media && !input.caption.trim() && !input.title.trim()) {
      return { ok: false, reason: "A Facebook post needs media or text." };
    }
    return { ok: true };
  },

  async publish(input: PublishInput): Promise<PublishResult> {
    const pageId = input.account.externalId;
    const message = [input.title, input.caption].filter(Boolean).join("\n\n");

    let endpoint: string;
    const params = new URLSearchParams({ access_token: input.account.accessToken });

    if (input.media?.kind === "video") {
      endpoint = `${GRAPH}/${pageId}/videos`;
      params.set("file_url", input.media.readUrl!);
      params.set("description", message);
      if (input.title) params.set("title", input.title.slice(0, 255));
    } else if (input.media?.kind === "image") {
      endpoint = `${GRAPH}/${pageId}/photos`;
      params.set("url", input.media.readUrl!);
      params.set("caption", message);
    } else {
      endpoint = `${GRAPH}/${pageId}/feed`;
      params.set("message", message);
    }

    const response = await fetch(endpoint, { method: "POST", body: params });
    const body = (await response.json().catch(() => ({}))) as {
      id?: string;
      error?: { message?: string; code?: number; is_transient?: boolean };
    };

    if (!response.ok || !body.id) {
      const transient = body.error?.is_transient || response.status >= 500 || response.status === 429;
      return {
        status: "FAILED",
        reason: body.error?.code
          ? `Facebook error ${body.error.code} while publishing.`
          : `Facebook rejected the post (HTTP ${response.status}).`,
        retryable: Boolean(transient),
      };
    }

    // Videos are processed asynchronously; photos and feed posts are immediate.
    if (input.media?.kind === "video") {
      return { status: "PROCESSING", externalId: body.id };
    }
    return {
      status: "PUBLISHED",
      externalId: body.id,
      externalUrl: `https://www.facebook.com/${body.id}`,
    };
  },

  async getStatus(account, externalId) {
    const url = new URL(`${GRAPH}/${externalId}`);
    url.searchParams.set("fields", "status,permalink_url");
    url.searchParams.set("access_token", account.accessToken);

    const response = await fetch(url);
    if (!response.ok) return { status: "PROCESSING" };

    const body = (await response.json()) as {
      status?: { video_status?: string };
      permalink_url?: string;
    };
    const videoStatus = body.status?.video_status;
    if (videoStatus === "error") {
      return { status: "FAILED", reason: "Facebook could not process the video." };
    }
    if (videoStatus && videoStatus !== "ready") return { status: "PROCESSING" };
    return {
      status: "PUBLISHED",
      externalUrl: body.permalink_url ? `https://www.facebook.com${body.permalink_url}` : null,
    };
  },
};
