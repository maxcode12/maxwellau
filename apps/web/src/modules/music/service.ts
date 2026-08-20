import { z } from "zod";
import { albums as staticAlbums, songs as staticSongs } from "@/content/music";
import type { Album, AlbumWithSongs, Song, StreamingDestination } from "@/modules/music/types";

/**
 * Music read model.
 *
 * Reads CMS-managed rows (Phase 3) and falls back to the checked-in verified
 * discography (`src/content/music.ts`) when the database is empty or
 * unreachable — the latter also covers CI builds with no DATABASE_URL.
 */

const streamingSchema = z
  .array(z.object({ platform: z.string(), label: z.string(), url: z.string().url() }))
  .catch([]);

function parseStreaming(value: unknown): readonly StreamingDestination[] {
  return streamingSchema.parse(value) as readonly StreamingDestination[];
}

type DbAlbum = {
  id: string;
  slug: string;
  title: string;
  type: Album["type"];
  releasedAt: Date;
  releasedAtPrecision: Album["releasedAtPrecision"];
  description: string;
  tracklistComplete: boolean;
  streamingLinks: unknown;
};

function mapAlbum(row: DbAlbum): Album {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    releasedAt: row.releasedAt.toISOString(),
    releasedAtPrecision: row.releasedAtPrecision,
    description: row.description,
    coverImageSlug: null,
    tracklistComplete: row.tracklistComplete,
    streaming: parseStreaming(row.streamingLinks),
    isSample: false,
  };
}

type DbSong = {
  id: string;
  slug: string;
  title: string;
  album: { slug: string } | null;
  trackNumber: number | null;
  durationSeconds: number | null;
  releasedAt: Date;
  releasedAtPrecision: Song["releasedAtPrecision"];
  featured: boolean;
  streamingLinks: unknown;
};

function mapSong(row: DbSong): Song {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    albumSlug: row.album?.slug ?? null,
    trackNumber: row.trackNumber,
    durationSeconds: row.durationSeconds,
    releasedAt: row.releasedAt.toISOString(),
    releasedAtPrecision: row.releasedAtPrecision,
    featured: row.featured,
    streaming: parseStreaming(row.streamingLinks),
    isSample: false,
  };
}

async function dbAlbums(): Promise<Album[] | null> {
  try {
    const { db } = await import("@/lib/db");
    const rows = await db.album.findMany({
      where: { visibility: "PUBLISHED" },
      orderBy: { releasedAt: "desc" },
    });
    return rows.length > 0 ? rows.map(mapAlbum) : null;
  } catch {
    return null;
  }
}

const byNewest = <T extends { releasedAt: string }>(a: T, b: T) =>
  Date.parse(b.releasedAt) - Date.parse(a.releasedAt);

export async function listAlbums(): Promise<Album[]> {
  return (await dbAlbums()) ?? [...staticAlbums].sort(byNewest);
}

export async function getAlbumBySlug(slug: string): Promise<AlbumWithSongs | null> {
  try {
    const { db } = await import("@/lib/db");
    const row = await db.album.findFirst({
      where: { slug, visibility: "PUBLISHED" },
      include: {
        songs: {
          where: { visibility: "PUBLISHED" },
          orderBy: [{ trackNumber: "asc" }, { title: "asc" }],
        },
      },
    });
    if (row) {
      return {
        ...mapAlbum(row),
        songs: row.songs.map((song) => mapSong({ ...song, album: { slug: row.slug } })),
      };
    }
  } catch {
    // fall through to static content
  }

  const album = staticAlbums.find((candidate) => candidate.slug === slug);
  if (!album) return null;
  const songs = staticSongs
    .filter((song) => song.albumSlug === album.slug)
    .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0));
  return { ...album, songs };
}

export async function listFeaturedSongs(limit = 4): Promise<Song[]> {
  try {
    const { db } = await import("@/lib/db");
    const rows = await db.song.findMany({
      where: { visibility: "PUBLISHED", featured: true },
      orderBy: { releasedAt: "desc" },
      take: limit,
      include: { album: { select: { slug: true } } },
    });
    if (rows.length > 0) return rows.map(mapSong);
  } catch {
    // fall through
  }
  return [...staticSongs].filter((song) => song.featured).sort(byNewest).slice(0, limit);
}

export async function getLatestRelease(): Promise<AlbumWithSongs | null> {
  const [latest] = await listAlbums();
  return latest ? getAlbumBySlug(latest.slug) : null;
}
