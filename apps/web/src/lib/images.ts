export type ImageAsset = {
  readonly slug: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly tags: readonly string[];
  readonly blurDataURL: string;
};

import { imageManifest } from "@/content/generated/image-manifest";

export { brandAssets } from "@/content/generated/image-manifest";

const bySlug = new Map<string, ImageAsset>(imageManifest.map((image) => [image.slug, image]));

/**
 * Look up a generated image by slug. Returns undefined rather than throwing so a
 * missing asset degrades to an empty state instead of a 500.
 */
export function getImage(slug: string): ImageAsset | undefined {
  return bySlug.get(slug);
}

export function getImages(...slugs: string[]): ImageAsset[] {
  return slugs.map(getImage).filter((image): image is ImageAsset => image !== undefined);
}

export function getImagesByTag(tag: string): ImageAsset[] {
  return imageManifest.filter((image) => image.tags.includes(tag));
}

export { imageManifest };
