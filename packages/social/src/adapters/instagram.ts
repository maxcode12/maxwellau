import type {
  PlatformCapabilities,
  PublishInput,
  PublishResult,
  SocialPublisher,
  ValidationResult,
} from "../contract";

/**
 * Instagram adapter — official Graph API content publishing for professional
 * (business/creator) accounts linked to a Facebook Page.
 *
 * Two-step flow: create a media container (`/media` with video_url/image_url),
 * then `/media_publish`. Long videos publish as Reels, per current API rules.
 * Personal accounts cannot publish via API — capability detection surfaces
 * that at connect time rather than failing at publish time.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

export const instagramPublisher: SocialPublisher = {
  platform: "INSTAGRAM",

  capabilities(): PlatformCapabilities {
    return {
      video: true,
      image: true,
      textOnly: false,
      statusPolling: true,
      nativeScheduling: false,
      maxCaptionLength: 2200,
      maxVideoDurationSeconds: 15 * 60, // Reels via API
      maxVideoBytes: 1024 * 1024 * 1024,
    };
  },

  async validate(input: PublishInput): Promise<ValidationResult> {
    if (!input.media) {
      return { ok: false, reason: "Instagram requires an image or a video." };
    }
    if (!input.media.readUrl) {
      return { ok: false, reason: "Instagram ingestion needs a readable media URL." };
    }
    if (input.caption.length > 2200) {
      return { ok: false, reason: "Instagram captions are limited to 2200 characters." };
    }
    return { ok: true };
  },

  async publish(input: PublishInput): Promise<PublishResult> {
    const igUserId = input.account.externalId;
    const caption = [input.title, input.caption].filter(Boolean).join("\n\n").slice(0, 2200);

    // 1. Create the media container.
    const containerParams = new URLSearchParams({
      access_token: input.account.accessToken,
      caption,
    });
    if (input.media!.kind === "video") {
      containerParams.set("media_type", "REELS");
      containerParams.set("video_url", input.media!.readUrl!);
    } else {
      containerParams.set("image_url", input.media!.readUrl!);
    }

    const containerResponse = await fetch(`${GRAPH}/${igUserId}/media`, {
      method: "POST",
      body: containerParams,
    });
    const container = (await containerResponse.json().catch(() => ({}))) as {
      id?: string;
      error?: { code?: number; is_transient?: boolean };
    };
    if (!containerResponse.ok || !container.id) {
      return {
        status: "FAILED",
        reason: container.error?.code
          ? `Instagram error ${container.error.code} while creating the media container.`
          : `Instagram rejected the media (HTTP ${containerResponse.status}).`,
        retryable: Boolean(container.error?.is_transient) || containerResponse.status >= 500,
      };
    }

    // 2. Wait for the container to finish processing (bounded poll).
    for (let poll = 0; poll < 30; poll++) {
      const statusUrl = new URL(`${GRAPH}/${container.id}`);
      statusUrl.searchParams.set("fields", "status_code");
      statusUrl.searchParams.set("access_token", input.account.accessToken);
      const statusResponse = await fetch(statusUrl);
      const status = (await statusResponse.json().catch(() => ({}))) as { status_code?: string };

      if (status.status_code === "FINISHED") break;
      if (status.status_code === "ERROR") {
        return { status: "FAILED", reason: "Instagram could not process the media.", retryable: true };
      }
      await new Promise((resolve) => setTimeout(resolve, 10_000));
    }

    // 3. Publish the container.
    const publishResponse = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
      method: "POST",
      body: new URLSearchParams({
        access_token: input.account.accessToken,
        creation_id: container.id,
      }),
    });
    const published = (await publishResponse.json().catch(() => ({}))) as {
      id?: string;
      error?: { code?: number; is_transient?: boolean };
    };
    if (!publishResponse.ok || !published.id) {
      return {
        status: "FAILED",
        reason: published.error?.code
          ? `Instagram error ${published.error.code} while publishing.`
          : `Instagram publish failed (HTTP ${publishResponse.status}).`,
        retryable: Boolean(published.error?.is_transient) || publishResponse.status >= 500,
      };
    }

    return { status: "PUBLISHED", externalId: published.id, externalUrl: null };
  },

  async getStatus(account, externalId) {
    const url = new URL(`${GRAPH}/${externalId}`);
    url.searchParams.set("fields", "permalink");
    url.searchParams.set("access_token", account.accessToken);
    const response = await fetch(url);
    if (!response.ok) return { status: "PROCESSING" };
    const body = (await response.json()) as { permalink?: string };
    return { status: "PUBLISHED", externalUrl: body.permalink ?? null };
  },
};
