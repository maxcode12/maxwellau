import { getImagesByTag, imageManifest, type ImageAsset } from "@/lib/images";

export type GalleryCategory = {
  readonly id: string;
  readonly label: string;
  readonly tag: string;
};

/**
 * Gallery read model.
 *
 * Phase 1 serves the owner-supplied photography from the build-time image
 * manifest. Phase 4 adds Azure Blob-hosted `Media` records alongside it; this
 * service becomes the place both sources are merged.
 */
export const galleryCategories: readonly GalleryCategory[] = [
  { id: "all", label: "All", tag: "" },
  { id: "worship", label: "Worship", tag: "worship" },
  { id: "live", label: "Live", tag: "live" },
  { id: "portrait", label: "Portraits", tag: "portrait" },
  { id: "team", label: "Team", tag: "team" },
] as const;

export async function listGalleryImages(tag?: string): Promise<ImageAsset[]> {
  if (!tag) return [...imageManifest];
  return getImagesByTag(tag);
}

export async function listPressImages(limit = 6): Promise<ImageAsset[]> {
  const portraits = getImagesByTag("portrait");
  const live = getImagesByTag("live");
  return [...portraits, ...live].slice(0, limit);
}
