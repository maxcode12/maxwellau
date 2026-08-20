/**
 * SAMPLE CONTENT — not real King's Time session data.
 *
 * Themes, dates and scripture selections are placeholders. Scripture references
 * are given without quoted text so no translation is misattributed.
 *
 * TODO: OWNER — replace with the real King's Time schedule, or manage through
 * the CMS (Phase 3).
 */
import type { KingsTimeSession } from "@/modules/kings-time/types";

export const sampleKingsTimeSessions: readonly KingsTimeSession[] = [
  {
    id: "sample-kt-1",
    slug: "sample-kings-time-november",
    title: "King's Time — Sample November Session",
    theme: "Sample Theme: Enthroned",
    description:
      "Placeholder session used to lay out the King's Time experience — the theme, scripture, livestream link and replay all render from this record.",
    startsAt: "2026-11-27T19:00:00.000Z",
    endsAt: "2026-11-27T21:30:00.000Z",
    scripture: { reference: "Psalm 22:3", text: null },
    imageSlug: "kings-time-01",
    livestreamUrl: null,
    replayUrl: null,
    relatedVideoSlugs: ["sample-kings-time-live"],
    status: "SCHEDULED",
    isSample: true,
  },
  {
    id: "sample-kt-2",
    slug: "sample-kings-time-october",
    title: "King's Time — Sample October Session",
    theme: "Sample Theme: The Sound of Heaven",
    description:
      "A second placeholder session so the archive listing and the previous/next navigation can be reviewed.",
    startsAt: "2026-10-30T19:00:00.000Z",
    endsAt: "2026-10-30T21:30:00.000Z",
    scripture: { reference: "Revelation 4:8", text: null },
    imageSlug: "kings-time-02",
    livestreamUrl: null,
    replayUrl: null,
    relatedVideoSlugs: [],
    status: "SCHEDULED",
    isSample: true,
  },
  {
    id: "sample-kt-3",
    slug: "sample-kings-time-september",
    title: "King's Time — Sample September Session",
    theme: "Sample Theme: Consecrated",
    description: "Placeholder past session demonstrating the archived state and replay affordance.",
    startsAt: "2026-06-26T19:00:00.000Z",
    endsAt: "2026-06-26T21:30:00.000Z",
    scripture: { reference: "Isaiah 6:1–8", text: null },
    imageSlug: "worship-raised-hand",
    livestreamUrl: null,
    replayUrl: null,
    relatedVideoSlugs: [],
    status: "ARCHIVED",
    isSample: true,
  },
];
