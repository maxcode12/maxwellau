import type { Metadata } from "next";
import { PageHero } from "@/components/common/page-hero";
import { VideoCard } from "@/components/cards/video-card";
import { Container, EmptyState, Section } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { buildMetadata } from "@/lib/seo";
import { listVideos } from "@/modules/videos/service";
import { videoCategoryLabels, type VideoCategory } from "@/modules/videos/types";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Videos",
  description:
    "Worship sessions, live recordings, music videos and King's Time broadcasts from Maxwell AU.",
  path: "/videos",
});

/** Display order for the grouped listing. */
const categoryOrder: readonly VideoCategory[] = [
  "WORSHIP_SESSION",
  "KINGS_TIME",
  "MUSIC_VIDEO",
  "LIVE",
  "BEHIND_THE_SCENES",
];

export default async function VideosPage() {
  const videos = await listVideos();

  const grouped = categoryOrder
    .map((category) => ({
      category,
      videos: videos.filter((video) => video.category === category),
    }))
    .filter((group) => group.videos.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Watch"
        title="Worship, live and in full"
        description="Sessions, live sets and visuals from the ministry."
        imageSlug="kings-time-02"
      />

      {grouped.length === 0 ? (
        <Section>
          <Container>
            <EmptyState
              title="No videos published yet"
              description="Worship sessions, live recordings and music videos will appear here."
            />
          </Container>
        </Section>
      ) : (
        grouped.map((group, index) => (
          <Section
            key={group.category}
            className={index % 2 === 1 ? "bg-ink-900/50" : undefined}
            aria-labelledby={`videos-${group.category}`}
          >
            <Container>
              <Reveal>
                <h2
                  id={`videos-${group.category}`}
                  className="text-2xl sm:text-3xl"
                >
                  {videoCategoryLabels[group.category]}
                </h2>
                <div className="mt-4 h-px w-16 rule-gold" aria-hidden="true" />
              </Reveal>

              <Reveal delay={80}>
                <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {group.videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </Reveal>
            </Container>
          </Section>
        ))
      )}
    </>
  );
}
