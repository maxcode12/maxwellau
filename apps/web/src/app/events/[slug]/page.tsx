import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Globe, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/common/layout-primitives";
import { getImage } from "@/lib/images";
import { absoluteUrl } from "@/lib/site-config";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { cn, formatDate, formatTime } from "@/lib/utils";
import {
  getEventBySlug,
  getEventDetail,
  listPastEvents,
  listUpcomingEvents,
} from "@/modules/events/service";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const [upcoming, past] = await Promise.all([listUpcomingEvents(), listPastEvents()]);
  return [...upcoming, ...past].map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return buildMetadata({
      title: "Event not found",
      description: "",
      path: `/events/${slug}`,
      noIndex: true,
    });
  }

  const image = event.imageSlug ? getImage(event.imageSlug) : undefined;
  return buildMetadata({
    title: event.title,
    description: event.description,
    path: `/events/${event.slug}`,
    type: "article",
    ...(image ? { image: image.src } : {}),
  });
}

export default async function EventPage({ params }: Params) {
  const { slug } = await params;
  const detail = await getEventDetail(slug);
  if (!detail) notFound();
  const { event, isPast } = detail;

  const image = event.imageSlug ? getImage(event.imageSlug) : undefined;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startsAt,
    ...(event.endsAt ? { endDate: event.endsAt } : {}),
    url: absoluteUrl(`/events/${event.slug}`),
    performer: { "@type": "MusicGroup", name: "Maxwell AU", url: absoluteUrl("/") },
    ...(image ? { image: absoluteUrl(image.src) } : {}),
  };

  return (
    <>
      <Section className="pt-32 sm:pt-40">
        <Container>
          <Link
            href="/events"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-8")}
          >
            <ArrowLeft aria-hidden="true" />
            All events
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,24rem)] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {isPast ? <Badge variant="neutral">Past event</Badge> : null}
                {event.status !== "SCHEDULED" ? (
                  <Badge variant="live">
                    {event.status === "CANCELLED" ? "Cancelled" : "Postponed"}
                  </Badge>
                ) : null}
                {event.isFree ? <Badge variant="royal">Free entry</Badge> : null}
              </div>

              <h1 className="mt-6 text-balance text-4xl sm:text-5xl">{event.title}</h1>
              <div className="mt-6 h-px w-20 rule-gold" aria-hidden="true" />

              <dl className="mt-8 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5 text-gold-400">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    <span className="sr-only">Date</span>
                  </dt>
                  <dd>
                    <time dateTime={event.startsAt} className="text-parchment">
                      {formatDate(event.startsAt, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                    <span className="ml-2 text-muted-warm tabular-nums">
                      {formatTime(event.startsAt)} UTC
                      {event.endsAt ? ` – ${formatTime(event.endsAt)} UTC` : ""}
                    </span>
                  </dd>
                </div>

                <div className="flex items-start gap-3">
                  <dt className="mt-0.5 text-gold-400">
                    {event.isOnline ? (
                      <Globe className="size-4" aria-hidden="true" />
                    ) : (
                      <MapPin className="size-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">Location</span>
                  </dt>
                  <dd className="text-parchment">
                    {event.isOnline
                      ? "Streamed online"
                      : event.location
                        ? [
                            event.location.venue,
                            event.location.addressLine,
                            event.location.city,
                            event.location.country,
                          ]
                            .filter(Boolean)
                            .join(", ")
                        : "Venue to be announced"}
                  </dd>
                </div>
              </dl>

              <p className="mt-8 max-w-2xl text-pretty leading-relaxed text-muted-warm">
                {event.description}
              </p>

              {!isPast && event.ticketUrl ? (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-9")}
                >
                  <Ticket aria-hidden="true" />
                  Get tickets
                </a>
              ) : null}
            </div>

            {image ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-ink-700/70 lg:order-last">
                <Image
                  src={image.src}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 24rem, 90vw"
                  placeholder="blur"
                  blurDataURL={image.blurDataURL}
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </Container>
      </Section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    </>
  );
}
