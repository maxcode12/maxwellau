/**
 * Maxwell AU discography.
 *
 * Source: the official biography (docs/content/Maxwell_AU_Biography.pdf).
 * Only releases named there are listed, at the date precision it gives.
 *
 * Cover artwork has not been supplied yet, so `coverImageSlug` is null and the
 * UI renders a branded placeholder. Streaming links are added in
 * `src/lib/site-config.ts` / per release once the owner provides them.
 * Tracklists beyond the songs named in the biography are unknown, so
 * `tracklistComplete` is false and no track count is published.
 *
 * Phase 3 moves this into the Album/Song tables behind the admin CMS.
 */
import type { Album, Song } from "@/modules/music/types";

export const albums: readonly Album[] = [
  {
    id: "album-shelter",
    slug: "shelter",
    title: "Shelter",
    type: "ALBUM",
    releasedAt: "2021-05-21T00:00:00.000Z",
    releasedAtPrecision: "day",
    description:
      "Maxwell AU's second album, released on 21 May 2021 — continuing his message of faith, worship, hope and complete dependence on God.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [],
    isSample: false,
  },
  {
    id: "album-dependable-god",
    slug: "dependable-god",
    title: "Dependable God",
    type: "ALBUM",
    releasedAt: "2014-09-01T00:00:00.000Z",
    releasedAtPrecision: "month",
    description:
      "The debut album, released in September 2014. It features “Hallelujah”, recorded with Faith Eze and Victorious Worshippers, which received the Akademia Music Award for Best Gospel/Ballad Song and nominations connected with the GMA/Covenant Awards and the Glass Achievement Awards.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [],
    isSample: false,
  },
  {
    id: "single-jesu-we-o-vie",
    slug: "jesu-we-o-vie",
    title: "Jesu We O’ Vie",
    type: "SINGLE",
    releasedAt: "2010-01-01T00:00:00.000Z",
    releasedAtPrecision: "year",
    description:
      "Maxwell AU's first single, released in 2010 and featuring Prince Micah — the beginning of his journey as a recording artist.",
    coverImageSlug: null,
    tracklistComplete: false,
    streaming: [],
    isSample: false,
  },
];

export const songs: readonly Song[] = [
  {
    id: "song-hallelujah",
    slug: "hallelujah",
    title: "Hallelujah (feat. Faith Eze & Victorious Worshippers)",
    albumSlug: "dependable-god",
    trackNumber: null,
    durationSeconds: null,
    releasedAt: "2014-09-01T00:00:00.000Z",
    releasedAtPrecision: "month",
    featured: true,
    streaming: [],
    isSample: false,
  },
  {
    id: "song-jesu-we-o-vie",
    slug: "jesu-we-o-vie",
    title: "Jesu We O’ Vie (feat. Prince Micah)",
    albumSlug: "jesu-we-o-vie",
    trackNumber: null,
    durationSeconds: null,
    releasedAt: "2010-01-01T00:00:00.000Z",
    releasedAtPrecision: "year",
    featured: true,
    streaming: [],
    isSample: false,
  },
];
