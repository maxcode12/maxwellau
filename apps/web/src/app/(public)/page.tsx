import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/sections/hero";
import { KingsTimeFeature } from "@/components/sections/kings-time-feature";
import { SocialSection } from "@/components/sections/social-section";
import { BookingCta } from "@/components/sections/booking-cta";
import { ReleaseCard } from "@/components/cards/release-card";
import { VideoCard } from "@/components/cards/video-card";
import { EventCard } from "@/components/cards/event-card";
import { TestimonyCard } from "@/components/cards/testimony-card";
import {
  Container,
  EmptyState,
  Section,
  SectionHeading,
} from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listAlbums } from "@/modules/music/service";
import { listFeaturedVideos } from "@/modules/videos/service";
import { listUpcomingEvents } from "@/modules/events/service";
import { listFeaturedTestimonies } from "@/modules/testimonies/service";
import { getCurrentSession } from "@/modules/kings-time/service";

/** Content changes rarely; revalidate hourly so date-sensitive sections stay honest. */
export const revalidate = 3600;

export default async function HomePage() {
  const [albums, videos, events, testimonies, kingsTime] = await Promise.all([
    listAlbums(),
    listFeaturedVideos(3),
    listUpcomingEvents(3),
    listFeaturedTestimonies(3),
    getCurrentSession(),
  ]);

  return (
    <>
      <Hero />

      {/* Latest music */}
      <Section aria-labelledby="music-heading">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              id="music-heading"
              eyebrow="Music"
              title="Latest releases"
              description="Worship songs written and recorded for the local and gathered church."
            />
            <Link
              href="/music"
              className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
            >
              All music
              <ArrowRight aria-hidden="true" />
            </Link>
          </Reveal>

          {albums.length > 0 ? (
            <Reveal delay={80}>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {albums.slice(0, 4).map((album) => (
                  <ReleaseCard key={album.id} album={album} />
                ))}
              </div>
            </Reveal>
          ) : (
            <EmptyState
              className="mt-12"
              title="Music is on the way"
              description="Releases will appear here as soon as they are published. Join the newsletter to hear first."
            />
          )}
        </Container>
      </Section>

      {/* Featured videos */}
      <Section className="bg-ink-900/50" aria-labelledby="videos-heading">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              id="videos-heading"
              eyebrow="Watch"
              title="Worship sessions"
              description="Live worship, music videos and moments from the road."
            />
            <Link
              href="/videos"
              className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
            >
              All videos
              <ArrowRight aria-hidden="true" />
            </Link>
          </Reveal>

          {videos.length > 0 ? (
            <Reveal delay={80}>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </Reveal>
          ) : (
            <EmptyState
              className="mt-12"
              title="Videos coming soon"
              description="Worship sessions and music videos will be published here."
            />
          )}
        </Container>
      </Section>

      <KingsTimeFeature session={kingsTime?.session ?? null} isUpcoming={kingsTime?.isUpcoming ?? false} />

      {/* Upcoming events */}
      <Section aria-labelledby="events-heading">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              id="events-heading"
              eyebrow="Events"
              title="Where we&rsquo;re next"
              description="Worship nights, conferences and services across the year."
            />
            <Link
              href="/events"
              className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
            >
              All events
              <ArrowRight aria-hidden="true" />
            </Link>
          </Reveal>

          {events.length > 0 ? (
            <Reveal delay={80}>
              <div className="mt-12 space-y-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </Reveal>
          ) : (
            <EmptyState
              className="mt-12"
              title="No dates announced yet"
              description="Upcoming ministry dates will be listed here as they are confirmed."
              action={
                <Link href="/booking" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  Invite Maxwell AU
                </Link>
              }
            />
          )}
        </Container>
      </Section>

      {/* Testimonies */}
      <Section className="bg-ink-900/50" aria-labelledby="testimonies-heading">
        <Container>
          <Reveal>
            <SectionHeading
              id="testimonies-heading"
              eyebrow="Testimonies"
              title="Lives transformed"
              description="What God has done through the ministry, told by the people it reached."
              align="center"
            />
          </Reveal>

          {testimonies.length > 0 ? (
            <Reveal delay={80}>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {testimonies.map((testimony) => (
                  <TestimonyCard key={testimony.id} testimony={testimony} />
                ))}
              </div>
            </Reveal>
          ) : (
            <EmptyState
              className="mt-12"
              title="Testimonies coming soon"
              description="Stories shared with the ministry will be published here with permission."
            />
          )}

          <div className="mt-10 flex justify-center">
            <Link
              href="/testimonies"
              className={cn(buttonVariants({ variant: "outline", size: "md" }))}
            >
              Read more testimonies
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </Section>

      <SocialSection />
      <BookingCta />
    </>
  );
}
