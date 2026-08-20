import { albums, songs } from "@/content/music";
import type { Album, AlbumWithSongs, Song } from "@/modules/music/types";

/**
 * Music read model.
 *
 * Backed by the verified discography in `src/content/music.ts` (sourced from
 * the official biography). Phase 2 replaces the bodies with Prisma repository
 * calls; no page or component changes.
 */

const byNewest = <T extends { releasedAt: string }>(a: T, b: T) =>
  Date.parse(b.releasedAt) - Date.parse(a.releasedAt);

export async function listAlbums(): Promise<Album[]> {
  return [...albums].sort(byNewest);
}

export async function getAlbumBySlug(slug: string): Promise<AlbumWithSongs | null> {
  const album = albums.find((candidate) => candidate.slug === slug);
  if (!album) return null;

  const albumSongs = songs
    .filter((song) => song.albumSlug === album.slug)
    .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0));

  return { ...album, songs: albumSongs };
}

export async function listFeaturedSongs(limit = 4): Promise<Song[]> {
  return [...songs]
    .filter((song) => song.featured)
    .sort(byNewest)
    .slice(0, limit);
}

export async function getLatestRelease(): Promise<AlbumWithSongs | null> {
  const [latest] = [...albums].sort(byNewest);
  return latest ? getAlbumBySlug(latest.slug) : null;
}
