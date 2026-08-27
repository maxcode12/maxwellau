/**
 * Maxwell AU discography.
 *
 * Source: TuneCore "My Discography" (web.tunecore.ca/discography), read
 * directly on 2026-08-27 — this is the artist's own distributor, so titles,
 * release types, exact release dates and UPCs below are authoritative.
 *
 * A handful of streaming links were confirmed by following them to their
 * actual destination (not guessed from label position): "Good" → Spotify,
 * "Dependable God" → Spotify, "Shelter" → Apple Music. Every other release's
 * per-track streaming links are left empty rather than guessed — add them via
 * the admin CMS (Phase 3) once confirmed.
 *
 * Cover artwork has not been supplied as image files, so `coverImageSlug` is
 * null and the UI renders a branded placeholder. Full tracklists beyond the
 * release title itself are not available from TuneCore's dashboard, so
 * `tracklistComplete` stays false.
 *
 * Phase 3 moves this into the Album/Song tables behind the admin CMS.
 */
import type { Album, Song } from "@/modules/music/types";

export const albums: readonly Album[] = [
  {
    id: "single-oh-king",
    slug: "oh-king",
    title: "Oh King",
    type: "SINGLE",
    releasedAt: "2025-07-25T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    description: "A single by Maxwell AU, featuring Precious Oreva and Great Ibru.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [],
    isSample: false,
  },
  {
    id: "album-shelter",
    slug: "shelter",
    title: "Shelter",
    type: "ALBUM",
    releasedAt: "2021-04-30T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    description:
      "Maxwell AU's second album — continuing his message of faith, worship, hope and complete dependence on God.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [
      {
        platform: "appleMusic",
        label: "Apple Music",
        url: "https://music.apple.com/us/album/shelter/1566316565",
      },
    ],
    isSample: false,
  },
  {
    id: "single-defender",
    slug: "defender",
    title: "Defender",
    type: "SINGLE",
    releasedAt: "2020-05-31T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    description: "A single by Maxwell AU.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [],
    isSample: false,
  },
  {
    id: "single-good",
    slug: "good",
    title: "Good",
    type: "SINGLE",
    releasedAt: "2020-04-21T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    description: "A single by Maxwell AU.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [
      {
        platform: "spotify",
        label: "Spotify",
        url: "https://open.spotify.com/album/6cuF79fOErHJnj98ybX9J1",
      },
    ],
    isSample: false,
  },
  {
    id: "album-dependable-god",
    slug: "dependable-god",
    title: "Dependable God",
    type: "ALBUM",
    releasedAt: "2014-09-30T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    description:
      "The debut album, by Maxwell AU & The Victorious Worshippers. It features “Hallelujah”, recorded with Faith Eze, which received the Akademia Music Award for Best Gospel/Ballad Song and nominations connected with the GMA/Covenant Awards and the Glass Achievement Awards.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [
      {
        platform: "spotify",
        label: "Spotify",
        url: "https://open.spotify.com/album/5ztNtGprN4XPfWsFBPHZtN",
      },
    ],
    isSample: false,
  },
  {
    id: "single-i-will-sing",
    slug: "i-will-sing",
    title: "I Will Sing",
    type: "SINGLE",
    releasedAt: "2013-12-04T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    description: "A single by Maxwell AU.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [],
    isSample: false,
  },
  {
    id: "single-holy-is-the-lamb",
    slug: "holy-is-the-lamb",
    title: "Holy Is the Lamb",
    type: "SINGLE",
    releasedAt: "2013-03-22T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    description: "A single by Maxwell AU.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [],
    isSample: false,
  },
  {
    id: "single-jesu-we-ovie",
    slug: "jesu-we-ovie",
    title: "Jesu We Ovie (Jesus You're King)",
    type: "SINGLE",
    releasedAt: "2012-12-08T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    description:
      "Maxwell AU's first single, featuring Prince Micah — the beginning of his journey as a recording artist.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [],
    isSample: false,
  },
];

export const songs: readonly Song[] = [
  {
    id: "song-oh-king",
    slug: "oh-king",
    title: "Oh King (feat. Precious Oreva & Great Ibru)",
    albumSlug: "oh-king",
    trackNumber: 1,
    durationSeconds: null,
    releasedAt: "2025-07-25T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    featured: true,
    streaming: [],
    isSample: false,
  },
  {
    id: "song-hallelujah",
    slug: "hallelujah",
    title: "Hallelujah (feat. Faith Eze & Victorious Worshippers)",
    albumSlug: "dependable-god",
    trackNumber: null,
    durationSeconds: null,
    releasedAt: "2014-09-30T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    featured: true,
    streaming: [
      {
        platform: "spotify",
        label: "Spotify",
        url: "https://open.spotify.com/album/5ztNtGprN4XPfWsFBPHZtN",
      },
    ],
    isSample: false,
  },
  {
    id: "song-defender",
    slug: "defender",
    title: "Defender",
    albumSlug: "defender",
    trackNumber: 1,
    durationSeconds: null,
    releasedAt: "2020-05-31T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    featured: true,
    streaming: [],
    isSample: false,
  },
  {
    id: "song-good",
    slug: "good",
    title: "Good",
    albumSlug: "good",
    trackNumber: 1,
    durationSeconds: 264,
    releasedAt: "2020-04-21T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    featured: true,
    streaming: [
      {
        platform: "spotify",
        label: "Spotify",
        url: "https://open.spotify.com/album/6cuF79fOErHJnj98ybX9J1",
      },
    ],
    isSample: false,
  },
  {
    id: "song-i-will-sing",
    slug: "i-will-sing",
    title: "I Will Sing",
    albumSlug: "i-will-sing",
    trackNumber: 1,
    durationSeconds: null,
    releasedAt: "2013-12-04T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    featured: false,
    streaming: [],
    isSample: false,
  },
  {
    id: "song-holy-is-the-lamb",
    slug: "holy-is-the-lamb",
    title: "Holy Is the Lamb",
    albumSlug: "holy-is-the-lamb",
    trackNumber: 1,
    durationSeconds: null,
    releasedAt: "2013-03-22T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    featured: false,
    streaming: [],
    isSample: false,
  },
  {
    id: "song-jesu-we-ovie",
    slug: "jesu-we-ovie",
    title: "Jesu We Ovie (Jesus You're King) (feat. Prince Micah)",
    albumSlug: "jesu-we-ovie",
    trackNumber: 1,
    durationSeconds: null,
    releasedAt: "2012-12-08T00:00:00.000Z",
    releasedAtPrecision: "DAY",
    featured: false,
    streaming: [],
    isSample: false,
  },
];
