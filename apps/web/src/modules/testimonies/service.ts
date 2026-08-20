import { withSamples } from "@/content/content-mode";
import { sampleTestimonies } from "@/content/sample/testimonies";
import type { Testimony } from "@/modules/testimonies/types";

/**
 * Testimonies read model: CMS-managed rows first (Phase 3), sample records as
 * the fallback. Only APPROVED testimonies are ever exposed publicly, and the
 * CMS additionally requires recorded consent before approval.
 */

type DbTestimony = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  quote: string;
  body: string | null;
  sharedAt: Date;
  featured: boolean;
  status: Testimony["status"];
};

function mapTestimony(row: DbTestimony): Testimony {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    location: row.location,
    quote: row.quote,
    body: row.body,
    sharedAt: row.sharedAt.toISOString(),
    featured: row.featured,
    status: row.status,
    isSample: false,
  };
}

async function publishedTestimonies(): Promise<readonly Testimony[]> {
  try {
    const { db } = await import("@/lib/db");
    const rows = await db.testimony.findMany({
      where: { status: "APPROVED", consentAt: { not: null } },
      orderBy: { sharedAt: "desc" },
    });
    if (rows.length > 0) return rows.map(mapTestimony);
  } catch {
    // fall through to sample content
  }
  return withSamples(sampleTestimonies).filter((testimony) => testimony.status === "APPROVED");
}

const byNewest = (a: Testimony, b: Testimony) => Date.parse(b.sharedAt) - Date.parse(a.sharedAt);

export async function listTestimonies(): Promise<Testimony[]> {
  return [...(await publishedTestimonies())].sort(byNewest);
}

export async function listFeaturedTestimonies(limit = 3): Promise<Testimony[]> {
  const testimonies = await publishedTestimonies();
  const featured = [...testimonies].filter((t) => t.featured).sort(byNewest);
  const pool = featured.length > 0 ? featured : [...testimonies].sort(byNewest);
  return pool.slice(0, limit);
}

export async function getTestimonyBySlug(slug: string): Promise<Testimony | null> {
  return (await publishedTestimonies()).find((testimony) => testimony.slug === slug) ?? null;
}
