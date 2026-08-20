import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/common/layout-primitives";
import { PlatformIcon } from "@/components/common/platform-icon";
import { getImage } from "@/lib/images";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { cn, formatDuration } from "@/lib/utils";
import { getAlbumBySlug, listAlbums } from "@/modules/music/service";
import { formatReleaseDate, schemaReleaseDate } from "@/modules/music/types";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const albums = await listAlbums();
  return albums.map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return buildMetadata({ title: "Release not found", description: "", path: `/music/${slug}`, noIndex: true });

  const cover = album.coverImageSlug ? getImage(album.coverImageSlug) : undefined;
  return buildMetadata({
    title: album.title,
    description: album.description,
    path: `/music/${album.slug}`,
    type: "article",
    publishedTime: album.releasedAt,
    ...(cover ? { image: cover.src } : {}),
  });
}

const typeLabels = { ALBUM: "Album", EP: "EP", SINGLE: "Single" } as const;

export default async function ReleasePage({ params }: Params) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const cover = album.coverImageSlug ? getImage(album.coverImageSlug) : undefined;
  const totalSeconds = album.songs.reduce((sum, song) => sum + (song.durationSeconds ?? 0), 0);

  const schema = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: album.title,
    albumReleaseType: album.type === "SINGLE" ? "SingleRelease" : "AlbumRelease",
    datePublished: schemaReleaseDate(album.releasedAt, album.releasedAtPrecision),
    description: album.description,
    url: absoluteUrl(`/music/${album.slug}`),
    byArtist: { "@type": "MusicGroup", name: "Maxwell AU", url: absoluteUrl("/") },
    ...(cover ? { image: absoluteUrl(cover.src) } : {}),
    ...(album.tracklistComplete
      ? {
          numTracks: album.songs.length,
          track: album.songs.map((song, index) => ({
            "@type": "MusicRecording",
            name: song.title,
            position: song.trackNumber ?? index + 1,
          })),
        }
      : {}),
  };

  return (
    <>
      <Section className="pt-32 sm:pt-40">
        <Container>
          <Link
            href="/music"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-8")}
          >
            <ArrowLeft aria-hidden="true" />
            All music
          </Link>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-ink-700/70 bg-ink-900">
              {cover ? (
                <Image
                  src={cover.src}
                  alt={`${album.title} cover artwork`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 22rem, 90vw"
                  placeholder="blur"
                  blurDataURL={cover.blurDataURL}
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-5 bg-[radial-gradient(80%_80%_at_50%_30%,var(--color-ink-800),var(--color-ink-900))] p-8">
                  <Image src={siteConfig.brand.mark} alt="" width={110} height={110} className="opacity-80" aria-hidden="true" />
                  <span className="text-center font-display text-2xl leading-snug text-gold-200/90">{album.title}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold">{typeLabels[album.type]}</Badge>
                <Badge variant="neutral">
                  <time dateTime={album.releasedAt}>
                    {formatReleaseDate(album.releasedAt, album.releasedAtPrecision)}
                  </time>
                </Badge>
                {album.tracklistComplete && album.songs.length > 0 ? (
                  <Badge variant="neutral">
                    {album.songs.length} {album.songs.length === 1 ? "track" : "tracks"}
                    {totalSeconds > 0 ? ` · ${formatDuration(totalSeconds)}` : ""}
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-6 text-balance text-4xl sm:text-5xl">{album.title}</h1>
              <div className="mt-6 h-px w-20 rule-gold" aria-hidden="true" />
              <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted-warm">
                {album.description}
              </p>

              {album.streaming.length > 0 ? (
                <ul className="mt-8 flex flex-wrap gap-3">
                  {album.streaming.map((destination) => (
                    <li key={destination.url}>
                      <a
                        href={destination.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline", size: "md" }))}
                      >
                        <PlatformIcon platform={destination.platform} className="size-4" />
                        {destination.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-8 text-sm text-muted-warm">
                  Streaming links for this release will be added shortly.
                </p>
              )}

              {album.songs.length > 0 ? (
                <>
                  <h2 className="mt-14 text-xs font-medium uppercase tracking-[0.2em] text-gold-400/90">
                    {album.tracklistComplete ? "Tracklist" : "Featured on this release"}
                  </h2>
                  <ol className="mt-5 divide-y divide-ink-700/70 border-y border-ink-700/70">
                    {album.songs.map((song, index) => (
                      <li key={song.id} className="flex items-center gap-4 py-3.5">
                        <span
                          className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-warm"
                          aria-hidden="true"
                        >
                          {song.trackNumber ?? index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{song.title}</span>
                        {song.durationSeconds ? (
                          <span className="shrink-0 text-sm tabular-nums text-muted-warm">
                            {formatDuration(song.durationSeconds)}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
    </>
  );
}
