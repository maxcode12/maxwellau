import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AdminBackLink, AdminPageHeader, StatusBadge } from "@/components/admin/primitives";
import { AlbumForm } from "@/modules/music/components/album-form";
import { SongForm } from "@/modules/music/components/song-form";
import { deleteSongAction } from "@/modules/music/admin-actions";
import { db } from "@/lib/db";
import { formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

function releaseDateInput(date: Date, precision: string): string {
  const iso = date.toISOString();
  if (precision === "YEAR") return iso.slice(0, 4);
  if (precision === "MONTH") return iso.slice(0, 7);
  return iso.slice(0, 10);
}

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const album = await db.album.findUnique({
    where: { id },
    include: { songs: { orderBy: [{ trackNumber: "asc" }, { title: "asc" }] } },
  });
  if (!album) notFound();

  return (
    <div className="space-y-10">
      <div>
        <AdminBackLink href="/admin/music" label="All releases" />
        <AdminPageHeader
          title={album.title}
          description={`/${album.slug}`}
          action={<StatusBadge status={album.visibility} />}
        />
      </div>

      <AlbumForm
        initial={{
          id: album.id,
          title: album.title,
          slug: album.slug,
          type: album.type,
          releasedAt: releaseDateInput(album.releasedAt, album.releasedAtPrecision),
          releasedAtPrecision: album.releasedAtPrecision,
          description: album.description,
          tracklistComplete: album.tracklistComplete,
          visibility: album.visibility,
        }}
      />

      <section aria-labelledby="album-songs" className="space-y-6 border-t border-ink-700/70 pt-8">
        <h2 id="album-songs" className="font-display text-xl text-parchment">
          Songs on this release
        </h2>

        {album.songs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-600 px-5 py-8 text-center text-sm text-muted-warm">
            No songs recorded yet — add the first one below.
          </p>
        ) : (
          <ul className="space-y-6">
            {album.songs.map((song) => (
              <li key={song.id} className="rounded-xl border border-ink-700/70 bg-ink-900/40 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-warm">
                    {song.trackNumber ? `Track ${song.trackNumber} · ` : ""}
                    {song.durationSeconds ? `${formatDuration(song.durationSeconds)} · ` : ""}
                    /{song.slug}
                  </p>
                  <form action={deleteSongAction}>
                    <input type="hidden" name="id" value={song.id} />
                    <input type="hidden" name="albumId" value={album.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </form>
                </div>
                <SongForm
                  initial={{
                    id: song.id,
                    albumId: album.id,
                    title: song.title,
                    trackNumber: song.trackNumber?.toString() ?? "",
                    durationSeconds: song.durationSeconds?.toString() ?? "",
                    releasedAt: releaseDateInput(song.releasedAt, song.releasedAtPrecision),
                    releasedAtPrecision: song.releasedAtPrecision,
                    featured: song.featured,
                    visibility: song.visibility,
                  }}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-xl border border-gold-500/30 bg-gold-400/5 p-5">
          <h3 className="mb-4 font-display text-lg text-parchment">Add a song</h3>
          <SongForm
            submitLabel="Add song"
            initial={{
              albumId: album.id,
              title: "",
              trackNumber: "",
              durationSeconds: "",
              releasedAt: releaseDateInput(album.releasedAt, album.releasedAtPrecision),
              releasedAtPrecision: album.releasedAtPrecision,
              featured: false,
              visibility: album.visibility === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
            }}
          />
        </div>
      </section>
    </div>
  );
}
