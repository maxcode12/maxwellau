/**
 * SAMPLE CONTENT — not real Maxwell AU video data.
 *
 * `youtubeId` is deliberately null on every record: pointing at a real YouTube
 * id that is not Maxwell AU's would be worse than an honest poster-only card.
 * The player renders a poster with a "watch" affordance until a real id or an
 * Azure-hosted source is supplied.
 *
 * TODO: OWNER — replace with real videos, or manage through the CMS (Phase 3).
 */
import type { Video } from "@/modules/videos/types";

export const sampleVideos: readonly Video[] = [
  {
    id: "sample-video-1",
    slug: "sample-worship-session-01",
    title: "Sample Worship Session",
    description:
      "Placeholder worship session used to lay out the video grid and player. Replace with a real session from the CMS.",
    category: "WORSHIP_SESSION",
    publishedAt: "2025-02-18T19:00:00.000Z",
    youtubeId: null,
    posterImageSlug: "hero-worship",
    durationSeconds: 2940,
    featured: true,
    isSample: true,
  },
  {
    id: "sample-video-2",
    slug: "sample-kings-time-live",
    title: "Sample King's Time Live",
    description:
      "Placeholder King's Time broadcast used to demonstrate how a monthly session appears in the video library.",
    category: "KINGS_TIME",
    publishedAt: "2025-01-31T20:00:00.000Z",
    youtubeId: null,
    posterImageSlug: "kings-time-01",
    durationSeconds: 5400,
    featured: true,
    isSample: true,
  },
  {
    id: "sample-video-3",
    slug: "sample-music-video",
    title: "Sample Music Video",
    description: "Placeholder music video used to demonstrate the release-linked video layout.",
    category: "MUSIC_VIDEO",
    publishedAt: "2024-11-08T12:00:00.000Z",
    youtubeId: null,
    posterImageSlug: "piano-portrait-01",
    durationSeconds: 318,
    featured: true,
    isSample: true,
  },
  {
    id: "sample-video-4",
    slug: "sample-live-set",
    title: "Sample Live Set",
    description: "Placeholder live recording with the full band.",
    category: "LIVE",
    publishedAt: "2024-08-24T18:30:00.000Z",
    youtubeId: null,
    posterImageSlug: "kings-time-02",
    durationSeconds: 3660,
    featured: false,
    isSample: true,
  },
  {
    id: "sample-video-5",
    slug: "sample-behind-the-scenes",
    title: "Sample Behind the Scenes",
    description: "Placeholder studio footage used to demonstrate the behind-the-scenes category.",
    category: "BEHIND_THE_SCENES",
    publishedAt: "2024-05-02T10:00:00.000Z",
    youtubeId: null,
    posterImageSlug: "live-band-bw",
    durationSeconds: 720,
    featured: false,
    isSample: true,
  },
  {
    id: "sample-video-6",
    slug: "sample-worship-session-02",
    title: "Sample Worship Session II",
    description: "Placeholder second worship session, used to fill out the grid at desktop widths.",
    category: "WORSHIP_SESSION",
    publishedAt: "2024-03-15T19:00:00.000Z",
    youtubeId: null,
    posterImageSlug: "ministering-03",
    durationSeconds: 2400,
    featured: false,
    isSample: true,
  },
];
