import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Globe, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getImage } from "@/lib/images";
import { cn, formatDate, formatTime } from "@/lib/utils";
import type { MinistryEvent } from "@/modules/events/types";

function locationLabel(event: MinistryEvent): string {
  if (event.isOnline) return "Online";
  if (!event.location) return "Venue to be announced";
  return `${event.location.venue}, ${event.location.city}`;
}

export function EventCard({ event, past = false }: { event: MinistryEvent; past?: boolean }) {
  const image = event.imageSlug ? getImage(event.imageSlug) : undefined;

  return (
    <article
      className={cn(
        "group grid gap-5 rounded-xl border border-ink-700/70 bg-ink-900/50 p-4 sm:grid-cols-[10rem_1fr] sm:items-center sm:p-5",
        past && "opacity-70",
      )}
    >
      <Link
        href={`/events/${event.slug}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-lg sm:aspect-square"
        tabIndex={-1}
        aria-hidden="true"
      >
        {image ? (
          <Image
            src={image.src}
            alt=""
            fill
            sizes="(min-width: 640px) 10rem, 90vw"
            placeholder="blur"
            blurDataURL={image.blurDataURL}
            className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-ink-800 text-ink-600">
            <CalendarDays className="size-8" aria-hidden="true" />
          </div>
        )}
      </Link>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={past ? "neutral" : "gold"}>
            <CalendarDays className="size-3" aria-hidden="true" />
            <time dateTime={event.startsAt}>{formatDate(event.startsAt)}</time>
          </Badge>
          {event.status !== "SCHEDULED" ? (
            <Badge variant="live">{event.status === "CANCELLED" ? "Cancelled" : "Postponed"}</Badge>
          ) : null}
          {event.isFree && !past ? <Badge variant="royal">Free entry</Badge> : null}
        </div>

        <h3 className="font-display text-xl leading-snug sm:text-2xl">
          <Link href={`/events/${event.slug}`} className="transition-colors hover:text-gold-200">
            {event.title}
          </Link>
        </h3>

        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-warm">
          <span className="inline-flex items-center gap-1.5">
            {event.isOnline ? (
              <Globe className="size-3.5" aria-hidden="true" />
            ) : (
              <MapPin className="size-3.5" aria-hidden="true" />
            )}
            {locationLabel(event)}
          </span>
          <span className="tabular-nums">
            <time dateTime={event.startsAt}>{formatTime(event.startsAt)} UTC</time>
          </span>
        </p>

        {!past && event.ticketUrl ? (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Ticket aria-hidden="true" />
            Tickets
          </a>
        ) : null}
      </div>
    </article>
  );
}
