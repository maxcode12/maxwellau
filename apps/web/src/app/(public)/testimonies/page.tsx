import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/common/page-hero";
import { TestimonyCard } from "@/components/cards/testimony-card";
import {
  Container,
  EmptyState,
  Section,
  SectionHeading,
} from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { buttonVariants } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { listTestimonies } from "@/modules/testimonies/service";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Testimonies",
  description:
    "Stories of what God has done through the Maxwell AU ministry, shared by the people who experienced it.",
  path: "/testimonies",
});

export default async function TestimoniesPage() {
  const testimonies = await listTestimonies();

  return (
    <>
      <PageHero
        eyebrow="Testimonies"
        title="Lives transformed"
        description="Worship is never only a sound. These are stories shared with the ministry, published with permission."
        imageSlug="worship-raised-hand"
      />

      <Section aria-labelledby="testimonies-list">
        <Container>
          <Reveal>
            <SectionHeading id="testimonies-list" eyebrow="Stories" title="What God has done" />
          </Reveal>

          {testimonies.length > 0 ? (
            <Reveal delay={80}>
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonies.map((testimony) => (
                  <TestimonyCard key={testimony.id} testimony={testimony} />
                ))}
              </div>
            </Reveal>
          ) : (
            <EmptyState
              className="mt-12"
              title="Testimonies coming soon"
              description="Stories shared with the ministry will be published here once they have been reviewed and permission has been given."
            />
          )}
        </Container>
      </Section>

      <Section className="bg-ink-900/50" aria-labelledby="share-testimony">
        <Container>
          <Reveal>
            <SectionHeading
              id="share-testimony"
              eyebrow="Share yours"
              title="Has the ministry touched your life?"
              description="If God has met you through this ministry, the team would love to hear about it."
              align="center"
            />
          </Reveal>
          <div className="mt-9 flex justify-center">
            <Link
              href="/contact?subject=testimony"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
            >
              Share a testimony
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
