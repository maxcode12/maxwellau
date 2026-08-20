import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/common/layout-primitives";
import { VideoPlayer } from "@/components/common/video-player";
import { VideoCard } from "@/components/cards/video-card";
import { getImage } from "@/lib/images";
import { absoluteUrl } from "@/lib/site-config";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { cn, formatDate, formatDuration } from "@/lib/utils";
import { getVideoBySlug, listVideos } from "@/modules/videos/service";
import { videoCategoryLabels } from "@/modules/videos/types";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const videos = await listVideos();
  return videos.map((video) => ({ slug: video.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) {
    return buildMetadata({
      title: "Video not found",
      description: "",
      path: `/videos/${slug}`,
      noIndex: true,
    });
  }

  const poster = video.posterImageSlug ? getImage(video.posterImageSlug) : undefined;
  return buildMetadata({
    title: video.title,
    description: video.description,
    path: `/videos/${video.slug}`,
    type: "video.other",
    publishedTime: video.publishedAt,
    ...(poster ? { image: poster.src } : {}),
  });
}

export default async function VideoPage({ params }: Params) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) notFound();

  const poster = video.posterImageSlug ? getImage(video.posterImageSlug) : undefined;
  const related = (await listVideos(video.category))
    .filter((candidate) => candidate.slug !== video.slug)
    .slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    uploadDate: video.publishedAt,
    url: absoluteUrl(`/videos/${video.slug}`),
    ...(poster ? { thumbnailUrl: absoluteUrl(poster.src) } : {}),
    ...(video.durationSeconds
      ? {
          duration: `PT${Math.floor(video.durationSeconds / 60)}M${video.durationSeconds % 60}S`,
        }
      : {}),
    ...(video.youtubeId
      ? { embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}` }
      : {}),
  };

  return (
    <>
      <Section className="pt-32 sm:pt-40">
        <Container>
          <Link
            href="/videos"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-8")}
          >
            <ArrowLeft aria-hidden="true" />
            All videos
          </Link>

          <VideoPlayer youtubeId={video.youtubeId} title={video.title} poster={poster} />

          <div className="mt-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">{videoCategoryLabels[video.category]}</Badge>
              <Badge variant="neutral">
                <time dateTime={video.publishedAt}>{formatDate(video.publishedAt)}</time>
              </Badge>
              {video.durationSeconds ? (
                <Badge variant="neutral">{formatDuration(video.durationSeconds)}</Badge>
              ) : null}
            </div>

            <h1 className="mt-6 text-balance text-3xl sm:text-4xl">{video.title}</h1>
            <div className="mt-6 h-px w-20 rule-gold" aria-hidden="true" />
            <p className="mt-6 text-pretty leading-relaxed text-muted-warm">{video.description}</p>
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section className="bg-ink-900/50" aria-labelledby="related-videos">
          <Container>
            <h2 id="related-videos" className="text-2xl sm:text-3xl">
              More {videoCategoryLabels[video.category].toLowerCase()}
            </h2>
            <div className="mt-4 h-px w-16 rule-gold" aria-hidden="true" />
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((candidate) => (
                <VideoCard key={candidate.id} video={candidate} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    </>
  );
}
