import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container, Eyebrow, Section } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { getImage } from "@/lib/images";
import { cn, formatDate, formatTime } from "@/lib/utils";
import type { KingsTimeSession } from "@/modules/kings-time/types";

/**
 * `isUpcoming` is passed in rather than derived here: reading the clock during
 * render makes the component impure.
 */
export function KingsTimeFeature({
  session,
  isUpcoming = false,
}: {
  session: KingsTimeSession | null;
  isUpcoming?: boolean;
}) {
  const image = session?.imageSlug ? getImage(session.imageSlug) : getImage("kings-time-01");

  return (
    <Section className="relative isolate overflow-hidden bg-ink-900" aria-labelledby="kings-time-heading">
      {image ? (
        <Image
          src={image.src}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          className="-z-20 object-cover opacity-25"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/60"
      />

      <Container className="relative">
        <Reveal className="max-w-2xl">
          <Eyebrow className="flex items-center gap-2">
            <Crown className="size-3.5" aria-hidden="true" />
            King&rsquo;s Time
          </Eyebrow>

          <h2 id="kings-time-heading" className="mt-4 text-balance text-3xl sm:text-4xl lg:text-5xl">
            A monthly gathering for <span className="text-foil">worship and prayer</span>
          </h2>

          <div className="mt-4 h-px w-20 rule-gold" aria-hidden="true" />

          {session ? (
            <div className="mt-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={isUpcoming ? "gold" : "neutral"}>
                  <CalendarDays className="size-3" aria-hidden="true" />
                  <time dateTime={session.startsAt}>{formatDate(session.startsAt)}</time>
                </Badge>
                <Badge variant="royal">{isUpcoming ? "Next session" : "Latest session"}</Badge>
              </div>

              <p className="font-display text-2xl text-parchment">{session.theme}</p>
              <p className="max-w-xl text-pretty leading-relaxed text-muted-warm">
                {session.description}
              </p>

              {session.scripture ? (
                <p className="flex items-center gap-2 text-sm text-gold-200/90">
                  <BookOpen className="size-4 shrink-0" aria-hidden="true" />
                  {session.scripture.reference}
                </p>
              ) : null}

              <p className="text-sm text-muted-warm">
                Begins{" "}
                <time dateTime={session.startsAt} className="tabular-nums text-parchment">
                  {formatTime(session.startsAt)} UTC
                </time>
              </p>
            </div>
          ) : (
            <p className="mt-8 max-w-xl leading-relaxed text-muted-warm">
              King&rsquo;s Time is a monthly worship and prayer encounter. The next session will be
              announced here.
            </p>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/kings-time"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
            >
              Explore King&rsquo;s Time
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
