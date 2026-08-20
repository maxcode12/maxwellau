import {
  AdminEmptyRow,
  AdminPageHeader,
  AdminTable,
  StatusBadge,
} from "@/components/admin/primitives";
import { MediaUploader } from "@/modules/media/components/media-uploader";
import { archiveMediaAction } from "@/modules/media/admin-actions";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatBytes(bytes: bigint | null): string {
  if (bytes === null) return "—";
  const value = Number(bytes);
  if (value >= 1024 * 1024 * 1024) return `${(value / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(value / 1024))}KB`;
}

export default async function AdminMediaPage() {
  const media = await db.media.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { uploadedBy: { select: { name: true } } },
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Media library"
        description="Files uploaded directly to Azure Blob Storage. Videos and artwork uploaded here can be attached to content and queued for social publishing."
      />

      <MediaUploader />

      <AdminTable
        caption="Media files"
        headers={["Title", "Type", "Size", "Uploaded", "By", "Status", ""]}
      >
        {media.length === 0 ? (
          <AdminEmptyRow colSpan={7} message="Nothing uploaded yet." />
        ) : (
          media.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-parchment/[0.03]">
              <td className="px-4 py-3">
                <span className="block font-medium text-parchment">{item.title}</span>
                <span className="block max-w-[16rem] truncate text-xs text-muted-warm">
                  {item.blobKey}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-warm">{item.type}</td>
              <td className="px-4 py-3 tabular-nums text-muted-warm">
                {formatBytes(item.sizeBytes)}
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {formatDate(item.createdAt.toISOString())}
              </td>
              <td className="px-4 py-3 text-muted-warm">{item.uploadedBy?.name ?? "—"}</td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <form action={archiveMediaAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-ink-600 px-3 py-1 text-xs text-muted-warm transition-colors hover:border-red-500/50 hover:text-red-300"
                  >
                    Archive
                  </button>
                </form>
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
