import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Quote } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/common/layout-primitives";
import { buildMetadata } from "@/lib/seo";
import { cn, formatDate } from "@/lib/utils";
import { getTestimonyBySlug, listTestimonies } from "@/modules/testimonies/service";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const testimonies = await listTestimonies();
  return testimonies.map((testimony) => ({ slug: testimony.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const testimony = await getTestimonyBySlug(slug);
  if (!testimony) {
    return buildMetadata({
      title: "Testimony not found",
      description: "",
      path: `/testimonies/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `Testimony — ${testimony.name}`,
    description: testimony.quote,
    path: `/testimonies/${testimony.slug}`,
    type: "article",
    publishedTime: testimony.sharedAt,
  });
}

export default async function TestimonyPage({ params }: Params) {
  const { slug } = await params;
  const testimony = await getTestimonyBySlug(slug);
  if (!testimony) notFound();

  return (
    <Section className="pt-32 sm:pt-40">
      <Container>
        <Link
          href="/testimonies"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-8")}
        >
          <ArrowLeft aria-hidden="true" />
          All testimonies
        </Link>

        <article className="mx-auto max-w-2xl">
          <Quote className="size-10 text-gold-500/60" aria-hidden="true" />

          <blockquote className="mt-6">
            <p className="text-pretty font-display text-2xl leading-relaxed text-parchment sm:text-3xl">
              &ldquo;{testimony.quote}&rdquo;
            </p>
          </blockquote>

          <p className="mt-6 text-sm text-gold-200">
            {testimony.name}
            {testimony.location ? (
              <span className="text-muted-warm"> · {testimony.location}</span>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-muted-warm">
            <time dateTime={testimony.sharedAt}>{formatDate(testimony.sharedAt)}</time>
          </p>

          {testimony.body ? (
            <div className="mt-10 space-y-5 border-t border-ink-700/70 pt-10">
              {testimony.body.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-pretty leading-relaxed text-muted-warm">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </article>
      </Container>
    </Section>
  );
}
