import { AdminEmptyRow, AdminPageHeader, AdminTable } from "@/components/admin/primitives";
import { requireRole } from "@/modules/auth/guards";
import { listAuditEntries } from "@/modules/audit/service";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireRole("ADMIN");
  const entries = await listAuditEntries(200);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit log"
        description="Sensitive administrative changes, most recent first."
      />

      <AdminTable caption="Audit log" headers={["When", "Actor", "Action", "Entity", "Detail"]}>
        {entries.length === 0 ? (
          <AdminEmptyRow colSpan={5} message="No audit entries yet." />
        ) : (
          entries.map((entry) => (
            <tr key={entry.id} className="align-top transition-colors hover:bg-parchment/[0.03]">
              <td className="whitespace-nowrap px-4 py-3 text-muted-warm">
                {entry.createdAt.toISOString().replace("T", " ").slice(0, 19)} UTC
              </td>
              <td className="px-4 py-3 text-parchment">{entry.actor?.name ?? "System"}</td>
              <td className="px-4 py-3">
                <code className="text-xs text-gold-200">{entry.action}</code>
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {entry.entityType}
                <span className="block max-w-[12rem] truncate text-xs text-muted-warm/60">
                  {entry.entityId}
                </span>
              </td>
              <td className="max-w-sm px-4 py-3">
                <code className="block truncate text-xs text-muted-warm">
                  {JSON.stringify(entry.detail)}
                </code>
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
