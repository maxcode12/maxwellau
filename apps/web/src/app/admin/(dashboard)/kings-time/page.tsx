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
import { cn, formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminKingsTimePage() {
  const sessions = await db.kingsTimeSession.findMany({
    orderBy: { startsAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="King's Time"
        description="The monthly worship and prayer encounter."
        action={
          <Link
            href="/admin/kings-time/new"
            className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
          >
            <Plus aria-hidden="true" />
            New session
          </Link>
        }
      />

      <AdminTable
        caption="King's Time sessions"
        headers={["Session", "Theme", "Starts", "Status", "Visibility"]}
      >
        {sessions.length === 0 ? (
          <AdminEmptyRow colSpan={5} message="No sessions yet. Create the first one." />
        ) : (
          sessions.map((session) => (
            <tr key={session.id} className="transition-colors hover:bg-parchment/[0.03]">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/kings-time/${session.id}`}
                  className="font-medium text-gold-200 hover:underline"
                >
                  {session.title}
                </Link>
                <span className="block text-xs text-muted-warm">/{session.slug}</span>
              </td>
              <td className="px-4 py-3 text-muted-warm">{session.theme}</td>
              <td className="px-4 py-3 text-muted-warm">
                {formatDate(session.startsAt.toISOString())} ·{" "}
                {formatTime(session.startsAt.toISOString())} UTC
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={session.status} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={session.visibility} />
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
