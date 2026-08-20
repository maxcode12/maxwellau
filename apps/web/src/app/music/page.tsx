import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/common/page-hero";
import { ReleaseCard } from "@/components/cards/release-card";
import {
  Container,
  EmptyState,
  Section,
  SectionHeading,
} from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { PlatformIcon } from "@/components/common/platform-icon";
import { buttonVariants } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { configuredLinks } from "@/lib/site-config";
import { cn, formatDuration } from "@/lib/utils";
import { formatReleaseDate } from "@/modules/music/types";
import { listAlbums, listFeaturedSongs } from "@/modules/music/service";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Music",
  description:
    "Albums, EPs and singles from Maxwell AU, with links to every streaming platform the music is available on.",
  path: "/music",
});

export default async function MusicPage() {
  const [albums, featured] = await Promise.all([listAlbums(), listFeaturedSongs(6)]);
  const streaming = configuredLinks("streaming");

  return (
    <>
      <PageHero
        eyebrow="Music"
        title="Songs for the gathered church"
        description="Every release, with links to listen wherever you already are."
        imageSlug="piano-portrait-01"
      />

      <Section aria-labelledby="releases-heading">
        <Container>
          <Reveal>
            <SectionHeading id="releases-heading" eyebrow="Discography" title="Releases" />
          </Reveal>

          {albums.length > 0 ? (
            <Reveal delay={80}>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {albums.map((album) => (
                  <ReleaseCard key={album.id} album={album} />
                ))}
              </div>
            </Reveal>
          ) : (
            <EmptyState
              className="mt-12"
              title="No releases published yet"
              description="Albums, EPs and singles will be listed here once they are published."
            />
          )}
        </Container>
      </Section>

      {featured.length > 0 ? (
        <Section className="bg-ink-900/50" aria-labelledby="featured-songs-heading">
          <Container>
            <Reveal>
              <SectionHeading
                id="featured-songs-heading"
                eyebrow="Start here"
                title="Featured songs"
              />
            </Reveal>

            <Reveal delay={80}>
              <ol className="mt-10 divide-y divide-ink-700/70 border-y border-ink-700/70">
                {featured.map((song, index) => (
                  <li
                    key={song.id}
                    className="flex items-center gap-4 py-4 transition-colors hover:bg-parchment/[0.03]"
                  >
                    <span
                      className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-warm"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-lg">{song.title}</span>
                      <span className="block text-xs text-muted-warm">
                        <time dateTime={song.releasedAt}>
                          {formatReleaseDate(song.releasedAt, song.releasedAtPrecision)}
                        </time>
                      </span>
                    </span>
                    {song.durationSeconds ? (
                      <span className="shrink-0 text-sm tabular-nums text-muted-warm">
                        {formatDuration(song.durationSeconds)}
                      </span>
                    ) : null}
                    {song.albumSlug ? (
                      <Link
                        href={`/music/${song.albumSlug}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "shrink-0")}
                      >
                        <span className="sr-only">Open the release containing </span>
                        Release
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ol>
            </Reveal>
          </Container>
        </Section>
      ) : null}

      <Section aria-labelledby="listen-heading">
        <Container>
          <Reveal>
            <SectionHeading
              id="listen-heading"
              eyebrow="Streaming"
              title="Where to listen"
              description="The music is distributed to the major streaming services."
              align="center"
            />
          </Reveal>

          {streaming.length > 0 ? (
            <Reveal delay={80}>
              <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-3">
                {streaming.map((link) => (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "outline", size: "md" }))}
                    >
                      <PlatformIcon platform={link.platform} className="size-4" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : (
            <EmptyState
              className="mx-auto mt-10 max-w-2xl"
              title="Streaming links coming soon"
              description="Links to Spotify, Apple Music and the other services will be added here."
            />
          )}
        </Container>
      </Section>
    </>
  );
}
