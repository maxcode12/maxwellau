/**
 * Maxwell AU video library.
 *
 * Source: the official YouTube channel (@maxwellau7355), read directly on
 * 2026-08-27. Titles, durations and video ids are exact. YouTube shows upload
 * dates only as relative time ("2 months ago") on the channel listing, so
 * `publishedAt` here is a month-level approximation (day fixed at the 1st) —
 * never treat it as an exact publish date.
 *
 * Poster frames use YouTube's own thumbnail CDN (i.ytimg.com), allow-listed in
 * next.config.ts, rather than a locally-stored image.
 *
 * Phase 3 moves this into the Video table behind the admin CMS.
 */
import type { Video } from "@/modules/videos/types";

function thumbnail(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export const videos: readonly Video[] = [
  {
    id: "video-oh-king-we-have-come",
    slug: "oh-king-we-have-come",
    title: "Oh King, We Have Come",
    description:
      "“Come, let us worship and bow down; let us kneel before the Lord our Maker.” — Psalm 95:6. Be blessed as you worship.",
    category: "MUSIC_VIDEO",
    publishedAt: "2026-06-01T00:00:00.000Z",
    youtubeId: "P6rrKjawIMg",
    posterImageSlug: null,
    posterUrl: thumbnail("P6rrKjawIMg"),
    durationSeconds: 300,
    featured: true,
    isSample: false,
  },
  {
    id: "video-kings-time-refining-moments",
    slug: "kings-time-refining-moments",
    title: "Kings Time Worship | Refining Moments in Worship",
    description: "A King's Time worship session — refining moments in worship.",
    category: "KINGS_TIME",
    publishedAt: "2026-05-01T00:00:00.000Z",
    youtubeId: "tZOm_fDp_gI",
    posterImageSlug: null,
    posterUrl: thumbnail("tZOm_fDp_gI"),
    durationSeconds: 3356,
    featured: true,
    isSample: false,
  },
  {
    id: "video-burn-everything-in-me",
    slug: "burn-everything-in-me",
    title: "Burn Everything in Me",
    description: "A worship session with Maxwell AU.",
    category: "WORSHIP_SESSION",
    publishedAt: "2026-05-01T00:00:00.000Z",
    youtubeId: "J964YvmBLTU",
    posterImageSlug: null,
    posterUrl: thumbnail("J964YvmBLTU"),
    durationSeconds: 1135,
    featured: true,
    isSample: false,
  },
  {
    id: "video-defender-live",
    slug: "defender-live",
    title: "Defender (Live)",
    description: "The official live video for “Defender.”",
    category: "MUSIC_VIDEO",
    publishedAt: "2025-11-01T00:00:00.000Z",
    youtubeId: "uyeexPtQguQ",
    posterImageSlug: null,
    posterUrl: thumbnail("uyeexPtQguQ"),
    durationSeconds: 659,
    featured: true,
    isSample: false,
  },
  {
    id: "video-worship-factory-ministration",
    slug: "worship-factory-ministration",
    title: "Worship Factory Ministration",
    description: "Live ministration at Worship Factory.",
    category: "LIVE",
    publishedAt: "2025-11-01T00:00:00.000Z",
    youtubeId: "8cTFYkcYnOA",
    posterImageSlug: null,
    posterUrl: thumbnail("8cTFYkcYnOA"),
    durationSeconds: 825,
    featured: false,
    isSample: false,
  },
  {
    id: "video-hallelujah-worship-medley",
    slug: "hallelujah-worship-medley",
    title: "Hallelujah | Worship Medley",
    description: "A worship medley built around “Hallelujah.”",
    category: "WORSHIP_SESSION",
    publishedAt: "2025-10-01T00:00:00.000Z",
    youtubeId: "1XCfQ2ZLEf4",
    posterImageSlug: null,
    posterUrl: thumbnail("1XCfQ2ZLEf4"),
    durationSeconds: 1728,
    featured: false,
    isSample: false,
  },
  {
    id: "video-yahweh-days-of-elijah-ihp-2013",
    slug: "yahweh-days-of-elijah-ihp-2013-windsor",
    title: "Yahweh, Days of Elijah Praise Medley | IHP 2013 Windsor",
    description: "A praise medley from IHP 2013, Windsor.",
    category: "LIVE",
    publishedAt: "2025-09-01T00:00:00.000Z",
    youtubeId: "o8Lv93-oiqo",
    posterImageSlug: null,
    posterUrl: thumbnail("o8Lv93-oiqo"),
    durationSeconds: 383,
    featured: false,
    isSample: false,
  },
  {
    id: "video-join-us-tomorrow",
    slug: "you-are-invited-to-join-us-tomorrow",
    title: "You Are Invited to Join Us Tomorrow",
    description: "A short invitation to an upcoming gathering.",
    category: "BEHIND_THE_SCENES",
    publishedAt: "2025-12-01T00:00:00.000Z",
    youtubeId: "YipLijkyNpQ",
    posterImageSlug: null,
    posterUrl: thumbnail("YipLijkyNpQ"),
    durationSeconds: 159,
    featured: false,
    isSample: false,
  },
];
