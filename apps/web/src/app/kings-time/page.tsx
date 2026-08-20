import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarDays, Crown, PlayCircle, Radio } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Container,
  EmptyState,
  Section,
  SectionHeading,
} from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { getImage } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { listSessions } from "@/modules/kings-time/service";
import type { KingsTimeSession } from "@/modules/kings-time/types";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "King's Time",
  description:
    "King's Time is a monthly worship and prayer encounter hosted by Maxwell AU. Find the next session, the theme and how to join.",
  path: "/kings-time",
});

function SessionCard({ session, past }: { session: KingsTimeSession; past?: boolean }) {
  const image = session.imageSlug ? getImage(session.imageSlug) : undefined;

  return (
    <Card as="article" className={cn("flex h-full flex-col", past && "opacity-80")}>
      {image ? (
        <Link href={`/kings-time/${session.slug}`} className="relative block aspect-[16/10]" tabIndex={-1} aria-hidden="true">
          <Image
            src={image.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 95vw"
            placeholder="blur"
            blurDataURL={image.blurDataURL}
            className="object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/25 to-transparent"
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={past ? "neutral" : "gold"}>
            <CalendarDays className="size-3" aria-hidden="true" />
            <time dateTime={session.startsAt}>{formatDate(session.startsAt)}</time>
          </Badge>
          {session.status === "LIVE" ? (
            <Badge variant="live">
              <Radio className="size-3" aria-hidden="true" />
              Live now
            </Badge>
          ) : null}
        </div>

        <h3 className="mt-4 font-display text-xl leading-snug">
          <Link href={`/kings-time/${session.slug}`} className="transition-colors hover:text-gold-200">
            {session.theme}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-warm">{session.description}</p>

        {session.scripture ? (
          <p className="mt-4 flex items-center gap-2 text-xs text-gold-200/90">
            <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
            {session.scripture.reference}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {session.livestreamUrl && !past ? (
            <a
              href={session.livestreamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
            >
              <Radio aria-hidden="true" />
              Watch live
            </a>
          ) : null}
          {session.replayUrl ? (
            <a
              href={session.replayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <PlayCircle aria-hidden="true" />
              Watch the replay
            </a>
          ) : null}
          <Link
            href={`/kings-time/${session.slug}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Session details
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default async function KingsTimePage() {
  const { upcoming, archive } = await listSessions();
  const next = upcoming[0];

  return (
    <>
      <PageHero
        eyebrow="King's Time"
        title={
          <>
            A monthly encounter of <span className="text-foil">worship and prayer</span>
          </>
        }
        description="King's Time gathers worshippers each month to sing, pray and wait on God together — in the room and online."
        imageSlug="kings-time-01"
      >
        {next ? (
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="gold">
              <Crown className="size-3" aria-hidden="true" />
              Next session
            </Badge>
            <p className="text-sm text-parchment">
              <time dateTime={next.startsAt}>
                {formatDate(next.startsAt, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              <span className="ml-2 text-muted-warm tabular-nums">
                {formatTime(next.startsAt)} UTC
              </span>
            </p>
          </div>
        ) : null}
      </PageHero>

      <Section aria-labelledby="kt-upcoming">
        <Container>
          <Reveal>
            <SectionHeading id="kt-upcoming" eyebrow="Coming up" title="Upcoming sessions" />
          </Reveal>

          {upcoming.length > 0 ? (
            <Reveal delay={80}>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </Reveal>
          ) : (
            <EmptyState
              className="mt-10"
              title="The next session is being planned"
              description="Dates and themes are announced here and to the newsletter first."
            />
          )}
        </Container>
      </Section>

      {archive.length > 0 ? (
        <Section className="bg-ink-900/50" aria-labelledby="kt-archive">
          <Container>
            <Reveal>
              <SectionHeading id="kt-archive" eyebrow="Archive" title="Previous sessions" />
            </Reveal>
            <Reveal delay={80}>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {archive.map((session) => (
                  <SessionCard key={session.id} session={session} past />
                ))}
              </div>
            </Reveal>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
