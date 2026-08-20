import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/common/layout-primitives";
import { getImage } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Cinematic home hero.
 *
 * The atmosphere is carried entirely by CSS (a slow background scale and staged
 * fade-ups), so there is no hero JavaScript, no layout shift and nothing to
 * hydrate. `motion-reduce:` variants plus the global reduced-motion block leave
 * a still, fully-legible image for anyone who has asked for less movement.
 */
export function Hero() {
  const backdrop = getImage("hero-worship");

  return (
    <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden pb-16 pt-32 sm:pb-24">
      {backdrop ? (
        <Image
          src={backdrop.src}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={backdrop.blurDataURL}
          className="-z-20 object-cover object-[50%_35%] motion-safe:animate-[slow-zoom_24s_ease-out_forwards]"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-ink-900" />
      )}

      {/* Legibility scrim: vertical for the copy, radial for the vignette. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_85%_at_50%_15%,transparent_25%,var(--color-ink-950)_100%)]"
      />

      <Container className="relative">
        <div className="max-w-3xl">
          <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.34em] text-gold-300/90 [animation-delay:120ms]">
            {siteConfig.tagline}
          </p>

          <h1 className="mt-6 animate-fade-up text-5xl leading-[0.95] text-balance sm:text-7xl lg:text-[5.5rem] [animation-delay:220ms]">
            <span className="block text-parchment">Maxwell</span>
            <span className="block text-foil">AU</span>
          </h1>

          <p className="mt-7 max-w-xl animate-fade-up text-pretty text-base leading-relaxed text-parchment/85 sm:text-lg [animation-delay:340ms]">
            Singer-songwriter, recording artist and worship minister — creating an atmosphere
            where people can encounter the presence of God.
          </p>

          <div className="mt-10 flex animate-fade-up flex-col gap-3 sm:flex-row sm:items-center [animation-delay:460ms]">
            <Link href="/music" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
              <Play aria-hidden="true" />
              Listen &amp; Watch
            </Link>
            <Link href="/booking" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Book Ministry
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent"
      />
    </section>
  );
}
