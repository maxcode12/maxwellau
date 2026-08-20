/**
 * SAMPLE CONTENT — not real Maxwell AU event data.
 *
 * Venues, cities and dates are placeholders chosen only so the upcoming/past
 * split, the calendar layout and the event structured data can be exercised.
 * Nothing here should be published as a real engagement.
 *
 * TODO: OWNER — replace with real events, or manage through the CMS (Phase 3).
 */
import type { MinistryEvent } from "@/modules/events/types";

export const sampleEvents: readonly MinistryEvent[] = [
  {
    id: "sample-event-1",
    slug: "sample-night-of-worship",
    title: "Sample Night of Worship",
    description:
      "Placeholder evening of worship used to demonstrate the upcoming-event layout, ticketing link and structured data.",
    startsAt: "2026-11-14T18:30:00.000Z",
    endsAt: "2026-11-14T21:30:00.000Z",
    location: {
      venue: "Sample Venue",
      addressLine: null,
      city: "London",
      country: "United Kingdom",
      countryCode: "GB",
    },
    isOnline: false,
    imageSlug: "worship-team-01",
    ticketUrl: null,
    isFree: true,
    status: "SCHEDULED",
    isSample: true,
  },
  {
    id: "sample-event-2",
    slug: "sample-worship-conference",
    title: "Sample Worship Conference",
    description:
      "Placeholder multi-day conference used to demonstrate an event with an end date and a ticketing call to action.",
    startsAt: "2027-03-05T09:00:00.000Z",
    endsAt: "2027-03-07T17:00:00.000Z",
    location: {
      venue: "Sample Conference Centre",
      addressLine: null,
      city: "Lagos",
      country: "Nigeria",
      countryCode: "NG",
    },
    isOnline: false,
    imageSlug: "ministering-01",
    ticketUrl: null,
    isFree: false,
    status: "SCHEDULED",
    isSample: true,
  },
  {
    id: "sample-event-3",
    slug: "sample-online-worship-encounter",
    title: "Sample Online Worship Encounter",
    description:
      "Placeholder streamed gathering used to demonstrate how an online event renders without a physical venue.",
    startsAt: "2026-12-19T19:00:00.000Z",
    endsAt: null,
    location: null,
    isOnline: true,
    imageSlug: "kings-time-02",
    ticketUrl: null,
    isFree: true,
    status: "SCHEDULED",
    isSample: true,
  },
  {
    id: "sample-event-4",
    slug: "sample-past-worship-night",
    title: "Sample Past Worship Night",
    description: "Placeholder past event used to demonstrate the archive listing.",
    startsAt: "2026-04-11T18:00:00.000Z",
    endsAt: "2026-04-11T21:00:00.000Z",
    location: {
      venue: "Sample Hall",
      addressLine: null,
      city: "Manchester",
      country: "United Kingdom",
      countryCode: "GB",
    },
    isOnline: false,
    imageSlug: "worship-team-02",
    ticketUrl: null,
    isFree: true,
    status: "SCHEDULED",
    isSample: true,
  },
  {
    id: "sample-event-5",
    slug: "sample-past-carol-service",
    title: "Sample Past Carol Service",
    description: "A second placeholder past event so the archive shows more than one row.",
    startsAt: "2025-12-20T17:00:00.000Z",
    endsAt: null,
    location: {
      venue: "Sample Chapel",
      addressLine: null,
      city: "Birmingham",
      country: "United Kingdom",
      countryCode: "GB",
    },
    isOnline: false,
    imageSlug: "fellowship-01",
    ticketUrl: null,
    isFree: true,
    status: "SCHEDULED",
    isSample: true,
  },
];
