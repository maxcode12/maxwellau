import { withSamples } from "@/content/content-mode";
import { sampleEvents } from "@/content/sample/events";
import type { MinistryEvent } from "@/modules/events/types";

function allEvents(): readonly MinistryEvent[] {
  return withSamples(sampleEvents);
}

/**
 * An event counts as upcoming until its end time has passed — a conference that
 * started yesterday and runs until Sunday should not drop into the archive.
 */
function eventEnd(event: MinistryEvent): number {
  return Date.parse(event.endsAt ?? event.startsAt);
}

export async function listUpcomingEvents(limit?: number, now = Date.now()): Promise<MinistryEvent[]> {
  const upcoming = [...allEvents()]
    .filter((event) => event.status !== "CANCELLED" && eventEnd(event) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming;
}

export async function listPastEvents(limit?: number, now = Date.now()): Promise<MinistryEvent[]> {
  const past = [...allEvents()]
    .filter((event) => eventEnd(event) < now)
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
  return typeof limit === "number" ? past.slice(0, limit) : past;
}

export async function getEventBySlug(slug: string): Promise<MinistryEvent | null> {
  return allEvents().find((event) => event.slug === slug) ?? null;
}

export type EventDetail = { readonly event: MinistryEvent; readonly isPast: boolean };

/**
 * Detail view model.
 *
 * `isPast` is derived here rather than in the page so the clock is read outside
 * render — a component that reads `Date.now()` during render is impure and can
 * produce a different answer on re-render.
 */
export async function getEventDetail(slug: string, now = Date.now()): Promise<EventDetail | null> {
  const event = await getEventBySlug(slug);
  return event ? { event, isPast: eventEnd(event) < now } : null;
}
