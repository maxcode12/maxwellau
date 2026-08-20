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
import { cn, formatDate } from "@/lib/utils";
import { videoCategoryLabels } from "@/modules/videos/types";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await db.video.findMany({
    orderBy: { publishedAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Videos"
        description="The website video library. Azure-hosted uploads arrive in Phase 4 — YouTube-hosted videos can be added now."
        action={
          <Link
            href="/admin/videos/new"
            className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
          >
            <Plus aria-hidden="true" />
            New video
          </Link>
        }
      />

      <AdminTable
        caption="Videos"
        headers={["Title", "Category", "Published", "Source", "Featured", "Visibility"]}
      >
        {videos.length === 0 ? (
          <AdminEmptyRow colSpan={6} message="No videos yet." />
        ) : (
          videos.map((video) => (
            <tr key={video.id} className="transition-colors hover:bg-parchment/[0.03]">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/videos/${video.id}`}
                  className="font-medium text-gold-200 hover:underline"
                >
                  {video.title}
                </Link>
                <span className="block text-xs text-muted-warm">/{video.slug}</span>
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {videoCategoryLabels[video.category]}
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {formatDate(video.publishedAt.toISOString())}
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {video.youtubeId ? "YouTube" : video.sourceMediaId ? "Azure" : "—"}
              </td>
              <td className="px-4 py-3 text-muted-warm">{video.featured ? "Yes" : "—"}</td>
              <td className="px-4 py-3">
                <StatusBadge status={video.visibility} />
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
