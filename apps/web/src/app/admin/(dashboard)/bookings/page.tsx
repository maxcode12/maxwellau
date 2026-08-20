import Link from "next/link";
import {
  AdminEmptyRow,
  AdminPageHeader,
  AdminTable,
  StatusBadge,
} from "@/components/admin/primitives";
import { db } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";
import { bookingStatuses } from "@/modules/bookings/schema";
import type { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = bookingStatuses.includes(status as BookingStatus)
    ? (status as BookingStatus)
    : undefined;

  const [bookings, counts] = await Promise.all([
    db.booking.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.booking.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (candidate: string) =>
    counts.find((entry) => entry.status === candidate)?._count ?? 0;
  const total = counts.reduce((sum, entry) => sum + entry._count, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bookings"
        description="Ministry booking requests from the public website."
      />

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        <Link
          href="/admin/bookings"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            !filter
              ? "border-gold-500/60 bg-gold-400/10 text-gold-200"
              : "border-ink-600 text-muted-warm hover:text-parchment",
          )}
        >
          All ({total})
        </Link>
        {bookingStatuses.map((candidate) => (
          <Link
            key={candidate}
            href={`/admin/bookings?status=${candidate}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === candidate
                ? "border-gold-500/60 bg-gold-400/10 text-gold-200"
                : "border-ink-600 text-muted-warm hover:text-parchment",
            )}
          >
            {candidate.replaceAll("_", " ")} ({countFor(candidate)})
          </Link>
        ))}
      </nav>

      <AdminTable
        caption="Booking requests"
        headers={["Reference", "Contact", "Event", "Event date", "Received", "Status"]}
      >
        {bookings.length === 0 ? (
          <AdminEmptyRow colSpan={6} message="No booking requests match this filter." />
        ) : (
          bookings.map((booking) => (
            <tr key={booking.id} className="transition-colors hover:bg-parchment/[0.03]">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="font-medium text-gold-200 hover:underline"
                >
                  {booking.reference}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className="block text-parchment">{booking.contactName}</span>
                {booking.organisation ? (
                  <span className="block text-xs text-muted-warm">{booking.organisation}</span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {booking.eventType.replaceAll("_", " ").toLowerCase()}
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {formatDate(booking.eventDate.toISOString())}
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {formatDate(booking.createdAt.toISOString())}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={booking.status} />
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
