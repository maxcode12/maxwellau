import Image from "next/image";
import Link from "next/link";
import { Film, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getImage } from "@/lib/images";
import { formatDate, formatDuration } from "@/lib/utils";
import { videoCategoryLabels, type Video } from "@/modules/videos/types";
import { cn } from "@/lib/utils";

export function VideoCard({ video, featured = false }: { video: Video; featured?: boolean }) {
  // External poster (e.g. YouTube's own thumbnail CDN) takes precedence over a
  // locally-managed image; either may be absent, in which case a plain icon
  // placeholder is shown instead.
  const managedPoster = video.posterImageSlug ? getImage(video.posterImageSlug) : undefined;
  const sizes = featured
    ? "(min-width: 1024px) 66vw, 95vw"
    : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 95vw";

  return (
    <article className={cn("group", featured && "lg:col-span-2")}>
      <Link
        href={`/videos/${video.slug}`}
        className="block overflow-hidden rounded-lg border border-ink-700/70 bg-ink-900"
      >
        <div className={cn("relative overflow-hidden", featured ? "aspect-[16/9]" : "aspect-video")}>
          {video.posterUrl ? (
            <Image
              src={video.posterUrl}
              alt=""
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : managedPoster ? (
            <Image
              src={managedPoster.src}
              alt=""
              fill
              sizes={sizes}
              placeholder="blur"
              blurDataURL={managedPoster.blurDataURL}
              className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-ink-800 text-ink-600">
              <Film className="size-10" aria-hidden="true" />
            </div>
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/25 to-transparent"
          />

          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold-300/70 bg-ink-950/55 text-gold-200 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-gold-200 group-hover:bg-gold-400/20 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          >
            <Play className="size-5 translate-x-0.5 fill-current" />
          </span>

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Badge variant="neutral">{videoCategoryLabels[video.category]}</Badge>
            {video.durationSeconds ? (
              <span className="rounded-full bg-ink-950/75 px-2 py-1 text-[0.6875rem] tabular-nums text-parchment/85">
                {formatDuration(video.durationSeconds)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="mt-4 space-y-1.5">
        <h3 className={cn("font-display leading-snug", featured ? "text-2xl" : "text-lg")}>
          <Link href={`/videos/${video.slug}`} className="transition-colors hover:text-gold-200">
            {video.title}
          </Link>
        </h3>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-warm">
          <time dateTime={video.publishedAt}>{formatDate(video.publishedAt)}</time>
        </p>
      </div>
    </article>
  );
}
