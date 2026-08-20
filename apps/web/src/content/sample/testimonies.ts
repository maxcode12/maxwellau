/**
 * SAMPLE CONTENT — not real testimonies.
 *
 * These are obviously-labelled placeholders. Publishing a fabricated testimony
 * as a real one would be a serious integrity problem, so each quote states
 * plainly that it is sample text rather than imitating a genuine account.
 *
 * TODO: OWNER — replace with real, permission-granted testimonies, or manage
 * them through the CMS (Phase 3).
 */
import type { Testimony } from "@/modules/testimonies/types";

export const sampleTestimonies: readonly Testimony[] = [
  {
    id: "sample-testimony-1",
    slug: "sample-testimony-one",
    name: "Sample Contributor",
    location: "Sample City",
    quote:
      "Sample testimony text. Real testimonies submitted to the ministry will appear here once the CMS is live.",
    body: null,
    sharedAt: "2026-05-02T00:00:00.000Z",
    featured: true,
    status: "APPROVED",
    isSample: true,
  },
  {
    id: "sample-testimony-2",
    slug: "sample-testimony-two",
    name: "Sample Contributor",
    location: null,
    quote:
      "A second sample entry, kept short so the card layout and the home page rotation can be reviewed at every breakpoint.",
    body: null,
    sharedAt: "2026-02-19T00:00:00.000Z",
    featured: true,
    status: "APPROVED",
    isSample: true,
  },
  {
    id: "sample-testimony-3",
    slug: "sample-testimony-three",
    name: "Sample Contributor",
    location: "Sample Town",
    quote:
      "A longer sample entry, used to check how the card behaves when a quote runs to several lines and the layout has to stay balanced against its neighbours.",
    body: "Sample long-form body text. When a contributor supplies a fuller account it is shown on the testimony detail page beneath the pull-quote.",
    sharedAt: "2025-11-11T00:00:00.000Z",
    featured: false,
    status: "APPROVED",
    isSample: true,
  },
];
