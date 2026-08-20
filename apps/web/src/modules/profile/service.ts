import { z } from "zod";
import { artistProfile as staticProfile } from "@/content/bio";
import type { ArtistProfile, BioSection } from "@/modules/profile/types";

const storedSectionSchema = z.object({
  id: z.string(),
  heading: z.string(),
  paragraphs: z.array(z.string()).min(1),
  imageSlug: z.string().nullable(),
  awaitingOwnerContent: z.boolean().default(false),
});

const storedSectionsSchema = z.array(storedSectionSchema).min(1);

/**
 * Artist profile read model.
 *
 * Reads the CMS-managed row when one exists and validates; otherwise serves
 * the checked-in biography (`src/content/bio.ts`). The fallback also covers
 * builds that run without a database.
 */
export async function getArtistProfile(): Promise<ArtistProfile> {
  try {
    // Dynamic import keeps `server-only` db out of any client-adjacent graph.
    const { db } = await import("@/lib/db");
    const row = await db.artistProfile.findFirst();
    if (!row) return staticProfile;

    const sections = storedSectionsSchema.safeParse(row.sections);
    return {
      name: row.name,
      role: row.role,
      tagline: row.tagline,
      summary: row.summary,
      summaryAwaitingOwnerContent: false,
      portraitImageSlug: staticProfile.portraitImageSlug,
      sections: sections.success ? sections.data : staticProfile.sections,
    };
  } catch {
    return staticProfile;
  }
}

export async function getBioSection(id: string): Promise<BioSection | null> {
  const profile = await getArtistProfile();
  return profile.sections.find((section) => section.id === id) ?? null;
}
