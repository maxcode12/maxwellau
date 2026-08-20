import type { Metadata } from "next";
import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { GalleryGrid } from "@/components/common/gallery-grid";
import {
  Container,
  EmptyState,
  Section,
  SectionHeading,
} from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { listGalleryImages } from "@/modules/media/service";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Media & Press",
  description:
    "Photography, brand assets and press information for Maxwell AU. For interview or press requests, get in touch.",
  path: "/media",
});

export default async function MediaPage() {
  const images = await listGalleryImages();

  return (
    <>
      <PageHero
        eyebrow="Media & Press"
        title="Photography and press resources"
        description="Images from worship nights, live sessions and the studio. For press enquiries, interviews or additional assets, contact the ministry team."
        imageSlug="team-group-01"
      />

      <Section aria-labelledby="gallery-heading">
        <Container>
          <Reveal>
            <SectionHeading id="gallery-heading" eyebrow="Gallery" title="Photography" />
          </Reveal>

          {images.length > 0 ? (
            <Reveal delay={80} className="mt-10 block">
              <GalleryGrid images={images} />
            </Reveal>
          ) : (
            <EmptyState
              className="mt-10"
              title="No images published yet"
              description="Photography from worship nights and sessions will appear here."
            />
          )}
        </Container>
      </Section>

      <Section className="bg-ink-900/50" aria-labelledby="press-heading">
        <Container>
          <Reveal>
            <SectionHeading
              id="press-heading"
              eyebrow="Press kit"
              title="For media and promoters"
              description="Brand assets and biography copy for event listings, articles and broadcast."
            />
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="font-display text-xl">Brand assets</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-warm">
                  The Maxwell AU logo lockup and monogram, supplied on a transparent background for
                  use on dark artwork.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={siteConfig.brand.lockup}
                    download
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    <Download aria-hidden="true" />
                    Logo lockup (PNG)
                  </a>
                  <a
                    href={siteConfig.brand.mark}
                    download
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    <Download aria-hidden="true" />
                    Monogram (PNG)
                  </a>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-display text-xl">Biography &amp; enquiries</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-warm">
                  Read the full biography, or get in touch for interview requests, high-resolution
                  photography and event copy.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/bio"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Read the biography
                  </Link>
                  <Link
                    href="/contact?subject=press"
                    className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
                  >
                    <Mail aria-hidden="true" />
                    Press enquiry
                  </Link>
                </div>
              </Card>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
