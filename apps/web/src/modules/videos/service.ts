import { withSamples } from "@/content/content-mode";
import { sampleVideos } from "@/content/sample/videos";
import type { Video, VideoCategory } from "@/modules/videos/types";

function allVideos(): readonly Video[] {
  return withSamples(sampleVideos);
}

const byNewest = (a: Video, b: Video) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

export async function listVideos(category?: VideoCategory): Promise<Video[]> {
  return [...allVideos()]
    .filter((video) => (category ? video.category === category : true))
    .sort(byNewest);
}

export async function listFeaturedVideos(limit = 3): Promise<Video[]> {
  const featured = [...allVideos()].filter((video) => video.featured).sort(byNewest);
  // Fall back to the newest videos so the home page is never empty when nothing
  // has been explicitly featured.
  const pool = featured.length > 0 ? featured : [...allVideos()].sort(byNewest);
  return pool.slice(0, limit);
}

export async function getVideoBySlug(slug: string): Promise<Video | null> {
  return allVideos().find((video) => video.slug === slug) ?? null;
}

export async function listVideoCategories(): Promise<VideoCategory[]> {
  return [...new Set(allVideos().map((video) => video.category))];
}
