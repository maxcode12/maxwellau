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

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await db.event.findMany({
    orderBy: { startsAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Events"
        description="Worship nights, conferences and services."
        action={
          <Link
            href="/admin/events/new"
            className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
          >
            <Plus aria-hidden="true" />
            New event
          </Link>
        }
      />

      <AdminTable
        caption="Events"
        headers={["Title", "Starts", "Location", "Status", "Visibility"]}
      >
        {events.length === 0 ? (
          <AdminEmptyRow colSpan={5} message="No events yet. Create the first one." />
        ) : (
          events.map((event) => (
            <tr key={event.id} className="transition-colors hover:bg-parchment/[0.03]">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/events/${event.id}`}
                  className="font-medium text-gold-200 hover:underline"
                >
                  {event.title}
                </Link>
                <span className="block text-xs text-muted-warm">/{event.slug}</span>
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {formatDate(event.startsAt.toISOString())}
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {event.isOnline ? "Online" : [event.venue, event.city].filter(Boolean).join(", ") || "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={event.status} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={event.visibility} />
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
