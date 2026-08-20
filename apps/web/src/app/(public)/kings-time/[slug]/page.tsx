import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, PlayCircle, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/common/layout-primitives";
import { VideoCard } from "@/components/cards/video-card";
import { getImage } from "@/lib/images";
import { absoluteUrl } from "@/lib/site-config";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { getSessionBySlug, getSessionDetail, listSessions } from "@/modules/kings-time/service";
import { getVideoBySlug } from "@/modules/videos/service";
import type { Video } from "@/modules/videos/types";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { upcoming, archive } = await listSessions();
  return [...upcoming, ...archive].map((session) => ({ slug: session.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const session = await getSessionBySlug(slug);
  if (!session) {
    return buildMetadata({
      title: "Session not found",
      description: "",
      path: `/kings-time/${slug}`,
      noIndex: true,
    });
  }

  const image = session.imageSlug ? getImage(session.imageSlug) : undefined;
  return buildMetadata({
    title: session.theme,
    description: session.description,
    path: `/kings-time/${session.slug}`,
    type: "article",
    ...(image ? { image: image.src } : {}),
  });
}

export default async function KingsTimeSessionPage({ params }: Params) {
  const { slug } = await params;
  const detail = await getSessionDetail(slug);
  if (!detail) notFound();
  const { session, isPast } = detail;

  const image = session.imageSlug ? getImage(session.imageSlug) : undefined;

  const relatedVideos = (
    await Promise.all(session.relatedVideoSlugs.map((videoSlug) => getVideoBySlug(videoSlug)))
  ).filter((video): video is Video => video !== null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: session.title,
    description: session.description,
    startDate: session.startsAt,
    ...(session.endsAt ? { endDate: session.endsAt } : {}),
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    url: absoluteUrl(`/kings-time/${session.slug}`),
    performer: { "@type": "MusicGroup", name: "Maxwell AU", url: absoluteUrl("/") },
    ...(image ? { image: absoluteUrl(image.src) } : {}),
  };

  return (
    <>
      <section className="relative isolate overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-40">
        {image ? (
          <>
            <Image
              src={image.src}
              alt=""
              fill
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={image.blurDataURL}
              className="-z-20 object-cover opacity-30"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/90 via-ink-950/85 to-ink-950"
            />
          </>
        ) : null}

        <Container className="relative">
          <Link
            href="/kings-time"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-8")}
          >
            <ArrowLeft aria-hidden="true" />
            All King&rsquo;s Time sessions
          </Link>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isPast ? "neutral" : "gold"}>
                <CalendarDays className="size-3" aria-hidden="true" />
                <time dateTime={session.startsAt}>{formatDate(session.startsAt)}</time>
              </Badge>
              {session.status === "LIVE" ? (
                <Badge variant="live">
                  <Radio className="size-3" aria-hidden="true" />
                  Live now
                </Badge>
              ) : null}
              {isPast ? <Badge variant="neutral">Archive</Badge> : null}
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.28em] text-gold-400/90">
              {session.title}
            </p>
            <h1 className="mt-3 text-balance text-4xl sm:text-5xl">{session.theme}</h1>
            <div className="mt-6 h-px w-20 rule-gold" aria-hidden="true" />

            <p className="mt-6 text-pretty leading-relaxed text-muted-warm sm:text-lg">
              {session.description}
            </p>

            <p className="mt-6 text-sm text-muted-warm">
              <time dateTime={session.startsAt} className="tabular-nums text-parchment">
                {formatTime(session.startsAt)} UTC
                {session.endsAt ? ` – ${formatTime(session.endsAt)} UTC` : ""}
              </time>
            </p>

            {session.scripture ? (
              <figure className="mt-10 border-l-2 border-gold-500/60 pl-6">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold-300">
                  <BookOpen className="size-3.5" aria-hidden="true" />
                  {session.scripture.reference}
                </p>
                {session.scripture.text ? (
                  <blockquote className="mt-3">
                    <p className="font-display text-xl leading-relaxed text-parchment/90">
                      {session.scripture.text}
                    </p>
                  </blockquote>
                ) : null}
              </figure>
            ) : null}

            <div className="mt-10 flex flex-wrap gap-3">
              {session.livestreamUrl && !isPast ? (
                <a
                  href={session.livestreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
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
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  <PlayCircle aria-hidden="true" />
                  Watch the replay
                </a>
              ) : null}
            </div>

            {!session.livestreamUrl && !session.replayUrl ? (
              <p className="mt-8 text-sm text-muted-warm">
                {isPast
                  ? "A replay of this session has not been published yet."
                  : "The livestream link will be published here before the session begins."}
              </p>
            ) : null}
          </div>
        </Container>
      </section>

      {relatedVideos.length > 0 ? (
        <Section className="bg-ink-900/50" aria-labelledby="kt-related">
          <Container>
            <h2 id="kt-related" className="text-2xl sm:text-3xl">
              From this session
            </h2>
            <div className="mt-4 h-px w-16 rule-gold" aria-hidden="true" />
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    </>
  );
}
