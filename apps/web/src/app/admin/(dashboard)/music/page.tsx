import Link from "next/link";
import { Plus } from "lucide-react";
import {
  AdminEmptyRow,
  AdminPageHeader,
  AdminTable,
  StatusBadge,
} from "@/components/admin/primitives";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const typeLabels = { ALBUM: "Album", EP: "EP", SINGLE: "Single" } as const;

export default async function AdminMusicPage() {
  const albums = await db.album.findMany({
    orderBy: { releasedAt: "desc" },
    include: { _count: { select: { songs: true } } },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Music"
        description="Albums, EPs, singles and their songs."
        action={
          <Link
            href="/admin/music/new"
            className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
          >
            <Plus aria-hidden="true" />
            New release
          </Link>
        }
      />

      <AdminTable
        caption="Releases"
        headers={["Title", "Type", "Released", "Songs", "Visibility"]}
      >
        {albums.length === 0 ? (
          <AdminEmptyRow colSpan={5} message="No releases yet." />
        ) : (
          albums.map((album) => (
            <tr key={album.id} className="transition-colors hover:bg-parchment/[0.03]">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/music/${album.id}`}
                  className="font-medium text-gold-200 hover:underline"
                >
                  {album.title}
                </Link>
                <span className="block text-xs text-muted-warm">/{album.slug}</span>
              </td>
              <td className="px-4 py-3 text-muted-warm">{typeLabels[album.type]}</td>
              <td className="px-4 py-3 text-muted-warm">
                {album.releasedAt.toISOString().slice(0, 10)}
              </td>
              <td className="px-4 py-3 text-muted-warm">{album._count.songs}</td>
              <td className="px-4 py-3">
                <StatusBadge status={album.visibility} />
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
