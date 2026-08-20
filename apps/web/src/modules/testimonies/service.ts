import { withSamples } from "@/content/content-mode";
import { sampleTestimonies } from "@/content/sample/testimonies";
import type { Testimony } from "@/modules/testimonies/types";

/** Only approved testimonies are ever exposed publicly. */
function publishedTestimonies(): readonly Testimony[] {
  return withSamples(sampleTestimonies).filter((testimony) => testimony.status === "APPROVED");
}

const byNewest = (a: Testimony, b: Testimony) => Date.parse(b.sharedAt) - Date.parse(a.sharedAt);

export async function listTestimonies(): Promise<Testimony[]> {
  return [...publishedTestimonies()].sort(byNewest);
}

export async function listFeaturedTestimonies(limit = 3): Promise<Testimony[]> {
  const featured = [...publishedTestimonies()].filter((t) => t.featured).sort(byNewest);
  const pool = featured.length > 0 ? featured : [...publishedTestimonies()].sort(byNewest);
  return pool.slice(0, limit);
}

export async function getTestimonyBySlug(slug: string): Promise<Testimony | null> {
  return publishedTestimonies().find((testimony) => testimony.slug === slug) ?? null;
}
