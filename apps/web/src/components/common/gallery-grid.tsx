"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { ImageAsset } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * Masonry-ish gallery with an accessible lightbox.
 *
 * The dialog uses the native `<dialog>` element so focus trapping, Escape and
 * inertness of the page behind come from the platform rather than from bespoke
 * key handling.
 */
export function GalleryGrid({ images }: { images: readonly ImageAsset[] }) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [active, setActive] = React.useState<ImageAsset | null>(null);

  const open = (image: ImageAsset) => {
    setActive(image);
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {images.map((image) => (
          <li
            key={image.slug}
            className={cn(image.height > image.width && "row-span-2")}
          >
            <button
              type="button"
              onClick={() => open(image)}
              className="group relative block size-full overflow-hidden rounded-lg border border-ink-700/70 bg-ink-900"
            >
              <span className={cn("block", image.height > image.width ? "aspect-[3/4]" : "aspect-[4/3]")}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  placeholder="blur"
                  blurDataURL={image.blurDataURL}
                  className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-ink-950/0 transition-colors duration-500 group-hover:bg-ink-950/25"
              />
              <span className="sr-only">Open larger view</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setActive(null)}
        onClick={(event) => {
          // Clicking the backdrop (the dialog element itself) dismisses.
          if (event.target === dialogRef.current) close();
        }}
        className="max-h-[92dvh] max-w-[94vw] rounded-xl border border-ink-700 bg-ink-950/95 p-0 text-parchment backdrop:bg-ink-950/85 backdrop:backdrop-blur-sm"
        aria-label="Image viewer"
      >
        {active ? (
          <figure className="relative m-0">
            <Image
              src={active.src}
              alt={active.alt}
              width={active.width}
              height={active.height}
              placeholder="blur"
              blurDataURL={active.blurDataURL}
              sizes="94vw"
              className="max-h-[80dvh] w-auto object-contain"
            />
            <figcaption className="px-5 py-4 text-sm text-muted-warm">{active.alt}</figcaption>
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-ink-950/80 text-parchment transition-colors hover:bg-ink-800"
            >
              <span className="sr-only">Close</span>
              <X className="size-5" aria-hidden="true" />
            </button>
          </figure>
        ) : null}
      </dialog>
    </>
  );
}
