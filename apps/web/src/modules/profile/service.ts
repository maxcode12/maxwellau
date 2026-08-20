import { artistProfile } from "@/content/bio";
import type { ArtistProfile, BioSection } from "@/modules/profile/types";

export async function getArtistProfile(): Promise<ArtistProfile> {
  return artistProfile;
}

export async function getBioSection(id: string): Promise<BioSection | null> {
  return artistProfile.sections.find((section) => section.id === id) ?? null;
}
