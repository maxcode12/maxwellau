import { withSamples } from "@/content/content-mode";
import { sampleEvents } from "@/content/sample/events";
import type { MinistryEvent } from "@/modules/events/types";

/**
 * Events read model: CMS-managed rows first (Phase 3), clearly-labelled sample
 * records as the fallback while the database is empty or unreachable.
 */

type DbEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date | null;
  isOnline: boolean;
  venue: string | null;
  addressLine: string | null;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  ticketUrl: string | null;
  isFree: boolean;
  status: MinistryEvent["status"];
};

function mapEvent(row: DbEvent): MinistryEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    location:
      !row.isOnline && row.venue && row.city && row.country && row.countryCode
        ? {
            venue: row.venue,
            addressLine: row.addressLine,
            city: row.city,
            country: row.country,
            countryCode: row.countryCode,
          }
        : null,
    isOnline: row.isOnline,
    imageSlug: null,
    ticketUrl: row.ticketUrl,
    isFree: row.isFree,
    status: row.status,
    isSample: false,
  };
}

async function allEvents(): Promise<readonly MinistryEvent[]> {
  try {
    const { db } = await import("@/lib/db");
    const rows = await db.event.findMany({
      where: { visibility: "PUBLISHED" },
      orderBy: { startsAt: "asc" },
    });
    if (rows.length > 0) return rows.map(mapEvent);
  } catch {
    // fall through to sample content
  }
  return withSamples(sampleEvents);
}

function eventEnd(event: MinistryEvent): number {
  return Date.parse(event.endsAt ?? event.startsAt);
}

export async function listUpcomingEvents(
  limit?: number,
  now = Date.now(),
): Promise<MinistryEvent[]> {
  const upcoming = (await allEvents())
    .filter((event) => event.status !== "CANCELLED" && eventEnd(event) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming;
}

export async function listPastEvents(limit?: number, now = Date.now()): Promise<MinistryEvent[]> {
  const past = (await allEvents())
    .filter((event) => eventEnd(event) < now)
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
  return typeof limit === "number" ? past.slice(0, limit) : past;
}

export async function getEventBySlug(slug: string): Promise<MinistryEvent | null> {
  return (await allEvents()).find((event) => event.slug === slug) ?? null;
}

export type EventDetail = { readonly event: MinistryEvent; readonly isPast: boolean };

/** `isPast` is derived here so components never read the clock during render. */
export async function getEventDetail(slug: string, now = Date.now()): Promise<EventDetail | null> {
  const event = await getEventBySlug(slug);
  return event ? { event, isPast: eventEnd(event) < now } : null;
}
