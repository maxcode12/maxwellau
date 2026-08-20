import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/common/page-hero";
import { EventCard } from "@/components/cards/event-card";
import {
  Container,
  EmptyState,
  Section,
  SectionHeading,
} from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { buttonVariants } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site-config";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { listPastEvents, listUpcomingEvents } from "@/modules/events/service";
import type { MinistryEvent } from "@/modules/events/types";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Events",
  description:
    "Upcoming worship nights, conferences and services where Maxwell AU is ministering, plus a record of past events.",
  path: "/events",
});

function eventSchema(event: MinistryEvent) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startsAt,
    ...(event.endsAt ? { endDate: event.endsAt } : {}),
    eventStatus:
      event.status === "CANCELLED"
        ? "https://schema.org/EventCancelled"
        : event.status === "POSTPONED"
          ? "https://schema.org/EventPostponed"
          : "https://schema.org/EventScheduled",
    eventAttendanceMode: event.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl(`/events/${event.slug}`),
    performer: { "@type": "MusicGroup", name: "Maxwell AU", url: absoluteUrl("/") },
    location: event.isOnline
      ? { "@type": "VirtualLocation", url: absoluteUrl(`/events/${event.slug}`) }
      : event.location
        ? {
            "@type": "Place",
            name: event.location.venue,
            address: {
              "@type": "PostalAddress",
              ...(event.location.addressLine ? { streetAddress: event.location.addressLine } : {}),
              addressLocality: event.location.city,
              addressCountry: event.location.countryCode,
            },
          }
        : undefined,
  };
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([listUpcomingEvents(), listPastEvents(8)]);

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Come and worship"
        description="Worship nights, conferences and services across the year."
        imageSlug="worship-team-01"
      >
        <Link href="/booking" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
          Invite Maxwell AU to your event
        </Link>
      </PageHero>

      <Section aria-labelledby="upcoming-heading">
        <Container>
          <Reveal>
            <SectionHeading id="upcoming-heading" eyebrow="Diary" title="Upcoming" />
          </Reveal>

          {upcoming.length > 0 ? (
            <Reveal delay={80}>
              <div className="mt-10 space-y-4">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </Reveal>
          ) : (
            <EmptyState
              className="mt-10"
              title="No dates announced yet"
              description="Confirmed ministry dates will be listed here. If you would like Maxwell AU at your event, send a booking request."
              action={
                <Link href="/booking" className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
                  Request a booking
                </Link>
              }
            />
          )}
        </Container>
      </Section>

      {past.length > 0 ? (
        <Section className="bg-ink-900/50" aria-labelledby="past-heading">
          <Container>
            <Reveal>
              <SectionHeading id="past-heading" eyebrow="Archive" title="Past events" />
            </Reveal>
            <Reveal delay={80}>
              <div className="mt-10 space-y-4">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} past />
                ))}
              </div>
            </Reveal>
          </Container>
        </Section>
      ) : null}

      {upcoming.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(upcoming.map(eventSchema)) }}
        />
      ) : null}
    </>
  );
}
