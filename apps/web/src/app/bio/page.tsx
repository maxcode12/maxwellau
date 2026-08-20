import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Container, Section } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { buttonVariants } from "@/components/ui/button";
import { getImage } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { getArtistProfile } from "@/modules/profile/service";
import { bioClosingLine } from "@/content/bio";
import { isProduction } from "@/content/content-mode";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Biography",
  description:
    "The story behind Maxwell AU — ministry vision, the journey, the music, King's Time and the people the ministry serves.",
  path: "/bio",
  type: "profile",
});

/**
 * Shown beside any section whose copy has not been supplied by the ministry.
 * Hidden in production so visitors never see editorial scaffolding, but the
 * placeholder paragraph itself still reads as unwritten rather than as fact.
 */
function AwaitingContentNotice() {
  if (isProduction) return null;
  return (
    <p className="mt-4 flex items-start gap-2 rounded-lg border border-gold-500/30 bg-gold-400/5 px-4 py-3 text-xs leading-relaxed text-gold-200/90">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      Awaiting the ministry&rsquo;s own copy. Edit{" "}
      <code className="text-gold-100">src/content/bio.ts</code> and set{" "}
      <code className="text-gold-100">awaitingOwnerContent: false</code>.
    </p>
  );
}

export default async function BioPage() {
  const profile = await getArtistProfile();
  const portrait = profile.portraitImageSlug ? getImage(profile.portraitImageSlug) : undefined;

  return (
    <>
      <PageHero
        eyebrow={profile.role}
        title={profile.name}
        description={profile.summary}
        imageSlug="piano-portrait-03"
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
            {portrait ? (
              <Reveal className="lg:sticky lg:top-28 lg:self-start">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-ink-700/70">
                  <Image
                    src={portrait.src}
                    alt={portrait.alt}
                    fill
                    sizes="(min-width: 1024px) 20rem, 90vw"
                    placeholder="blur"
                    blurDataURL={portrait.blurDataURL}
                    className="object-cover"
                  />
                </div>
                <p className="mt-6 text-xs uppercase tracking-[0.2em] text-gold-400/90">
                  {profile.tagline}
                </p>
              </Reveal>
            ) : null}

            <div className="space-y-16">
              {profile.sections.map((section, index) => {
                const sectionImage = section.imageSlug ? getImage(section.imageSlug) : undefined;

                return (
                  <Reveal key={section.id} delay={index === 0 ? 0 : 60}>
                    <article id={section.id} className="scroll-mt-28">
                      <h2 className="text-2xl sm:text-3xl">{section.heading}</h2>
                      <div className="mt-4 h-px w-16 rule-gold" aria-hidden="true" />

                      <div className="mt-6 space-y-5">
                        {section.paragraphs.map((paragraph, paragraphIndex) => (
                          <p
                            key={paragraphIndex}
                            className={cn(
                              "text-pretty leading-relaxed",
                              section.awaitingOwnerContent
                                ? "italic text-muted-warm/70"
                                : "text-muted-warm",
                            )}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {section.awaitingOwnerContent ? <AwaitingContentNotice /> : null}

                      {sectionImage ? (
                        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl border border-ink-700/70">
                          <Image
                            src={sectionImage.src}
                            alt={sectionImage.alt}
                            fill
                            sizes="(min-width: 1024px) 45rem, 90vw"
                            placeholder="blur"
                            blurDataURL={sectionImage.blurDataURL}
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-900/50">
        <Container className="flex flex-col items-center gap-8 text-center">
          <blockquote className="mx-auto max-w-2xl">
            <p className="text-balance font-display text-2xl leading-relaxed text-gold-200/90 sm:text-3xl">
              &ldquo;{bioClosingLine}&rdquo;
            </p>
          </blockquote>
          <div className="h-px w-20 rule-gold" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl">Invite Maxwell AU to minister</h2>
          <Link href="/booking" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
            Request a booking
            <ArrowRight aria-hidden="true" />
          </Link>
        </Container>
      </Section>
    </>
  );
}
