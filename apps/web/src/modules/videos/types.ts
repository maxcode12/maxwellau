import type { Sampled } from "@/content/content-mode";

export type VideoCategory =
  | "WORSHIP_SESSION"
  | "MUSIC_VIDEO"
  | "LIVE"
  | "KINGS_TIME"
  | "BEHIND_THE_SCENES";

export const videoCategoryLabels: Record<VideoCategory, string> = {
  WORSHIP_SESSION: "Worship Session",
  MUSIC_VIDEO: "Music Video",
  LIVE: "Live",
  KINGS_TIME: "King's Time",
  BEHIND_THE_SCENES: "Behind the Scenes",
};

export type Video = Sampled & {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly category: VideoCategory;
  /** UTC ISO-8601. */
  readonly publishedAt: string;
  /**
   * YouTube video id when the video is hosted on the channel. Null once a video
   * is served from Azure Blob Storage instead (Phase 4).
   */
  readonly youtubeId: string | null;
  /** Slug into the generated image manifest, used as the poster frame. */
  readonly posterImageSlug: string | null;
  readonly durationSeconds: number | null;
  readonly featured: boolean;
};
