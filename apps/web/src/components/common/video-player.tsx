"use client";

import * as React from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { ImageAsset } from "@/lib/images";

/**
 * Click-to-load YouTube facade.
 *
 * The iframe is only mounted after an explicit activation, so no third-party
 * script, cookie or request is made on page load. `youtube-nocookie.com` is used
 * for the embed and matches the `frame-src` entry in the CSP.
 */
export function VideoPlayer({
  youtubeId,
  title,
  poster,
}: {
  youtubeId: string | null;
  title: string;
  poster?: ImageAsset | undefined;
}) {
  const [active, setActive] = React.useState(false);

  if (active && youtubeId) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border border-ink-700/70 bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      </div>
    );
  }

  const posterNode = poster ? (
    <Image
      src={poster.src}
      alt=""
      fill
      priority
      sizes="(min-width: 1024px) 60rem, 100vw"
      placeholder="blur"
      blurDataURL={poster.blurDataURL}
      className="object-cover"
    />
  ) : (
    <div className="absolute inset-0 bg-ink-800" />
  );

  if (!youtubeId) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border border-ink-700/70 bg-ink-900">
        {posterNode}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/50 to-ink-950/20"
        />
        <p className="absolute inset-x-6 bottom-6 text-sm text-muted-warm">
          This video is not yet available to play. The recording will be published here shortly.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-ink-700/70 bg-ink-900"
    >
      {posterNode}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent"
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold-300/70 bg-ink-950/60 text-gold-200 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-gold-400/20 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      >
        <Play className="size-7 translate-x-1 fill-current" />
      </span>
      <span className="sr-only">Play {title}</span>
    </button>
  );
}
