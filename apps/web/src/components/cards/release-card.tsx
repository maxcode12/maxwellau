import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getImage } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";
import { formatReleaseDate, type Album } from "@/modules/music/types";

const typeLabels = { ALBUM: "Album", EP: "EP", SINGLE: "Single" } as const;

/** Branded stand-in shown until real cover artwork is supplied. */
function CoverPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-4 bg-[radial-gradient(80%_80%_at_50%_30%,var(--color-ink-800),var(--color-ink-900))] p-6">
      <Image
        src={siteConfig.brand.mark}
        alt=""
        width={72}
        height={72}
        className="opacity-80"
        aria-hidden="true"
      />
      <span className="text-center font-display text-lg leading-snug text-gold-200/90">
        {title}
      </span>
    </div>
  );
}

export function ReleaseCard({ album }: { album: Album }) {
  const cover = album.coverImageSlug ? getImage(album.coverImageSlug) : undefined;

  return (
    <article className="group">
      <Link
        href={`/music/${album.slug}`}
        className="block overflow-hidden rounded-lg border border-ink-700/70 bg-ink-900"
      >
        <div className="relative aspect-square overflow-hidden">
          {cover ? (
            <Image
              src={cover.src}
              alt={`${album.title} cover artwork`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
              placeholder="blur"
              blurDataURL={cover.blurDataURL}
              className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <CoverPlaceholder title={album.title} />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent"
          />
          <div className="absolute left-3 top-3">
            <Badge variant="gold">{typeLabels[album.type]}</Badge>
          </div>
        </div>
      </Link>

      <div className="mt-4 space-y-1.5">
        <h3 className="font-display text-xl leading-snug">
          <Link href={`/music/${album.slug}`} className="transition-colors hover:text-gold-200">
            {album.title}
          </Link>
        </h3>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-warm">
          <time dateTime={album.releasedAt}>
            {formatReleaseDate(album.releasedAt, album.releasedAtPrecision)}
          </time>
        </p>
      </div>
    </article>
  );
}
