import Image from "next/image";
import { Container, Eyebrow } from "@/components/common/layout-primitives";
import { getImage } from "@/lib/images";
import { cn } from "@/lib/utils";

/** Consistent masthead for every interior page. */
export function PageHero({
  eyebrow,
  title,
  description,
  imageSlug,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  imageSlug?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const image = imageSlug ? getImage(imageSlug) : undefined;

  return (
    <section className={cn("relative isolate overflow-hidden pb-16 pt-36 sm:pb-20 sm:pt-44", className)}>
      {image ? (
        <>
          <Image
            src={image.src}
            alt=""
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={image.blurDataURL}
            className="-z-20 object-cover opacity-35"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/85 via-ink-950/80 to-ink-950"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,var(--color-ink-850),var(--color-ink-950))]"
        />
      )}

      <Container className="relative">
        <div className="max-w-3xl">
          {eyebrow ? <Eyebrow className="animate-fade-up">{eyebrow}</Eyebrow> : null}
          <h1 className="mt-4 animate-fade-up text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-6xl [animation-delay:100ms]">
            {title}
          </h1>
          <div className="mt-6 h-px w-20 rule-gold" aria-hidden="true" />
          {description ? (
            <p className="mt-6 max-w-2xl animate-fade-up text-pretty leading-relaxed text-muted-warm sm:text-lg [animation-delay:200ms]">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-8 animate-fade-up [animation-delay:300ms]">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
