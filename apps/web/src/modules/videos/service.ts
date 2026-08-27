import { videos as realVideos } from "@/content/videos";
import type { Video, VideoCategory } from "@/modules/videos/types";

/**
 * Video read model: CMS-managed rows first (Phase 3), the real YouTube
 * catalog (`src/content/videos.ts`) as the fallback while the database is
 * empty or unreachable.
 */

type DbVideo = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: VideoCategory;
  publishedAt: Date;
  youtubeId: string | null;
  durationSeconds: number | null;
  featured: boolean;
};

function mapVideo(row: DbVideo): Video {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    publishedAt: row.publishedAt.toISOString(),
    youtubeId: row.youtubeId,
    posterImageSlug: null,
    posterUrl: row.youtubeId ? `https://i.ytimg.com/vi/${row.youtubeId}/hqdefault.jpg` : null,
    durationSeconds: row.durationSeconds,
    featured: row.featured,
    isSample: false,
  };
}

async function allVideos(): Promise<readonly Video[]> {
  try {
    const { db } = await import("@/lib/db");
    const rows = await db.video.findMany({
      where: { visibility: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    });
    if (rows.length > 0) return rows.map(mapVideo);
  } catch {
    // fall through to sample content
  }
  return realVideos;
}

const byNewest = (a: Video, b: Video) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

export async function listVideos(category?: VideoCategory): Promise<Video[]> {
  return [...(await allVideos())]
    .filter((video) => (category ? video.category === category : true))
    .sort(byNewest);
}

export async function listFeaturedVideos(limit = 3): Promise<Video[]> {
  const videos = await allVideos();
  const featured = [...videos].filter((video) => video.featured).sort(byNewest);
  const pool = featured.length > 0 ? featured : [...videos].sort(byNewest);
  return pool.slice(0, limit);
}

export async function getVideoBySlug(slug: string): Promise<Video | null> {
  return (await allVideos()).find((video) => video.slug === slug) ?? null;
}

export async function listVideoCategories(): Promise<VideoCategory[]> {
  return [...new Set((await allVideos()).map((video) => video.category))];
}
