import { notFound } from "next/navigation";
import { AdminBackLink, AdminPageHeader, StatusBadge } from "@/components/admin/primitives";
import { BookingWorkflowForm } from "@/modules/bookings/components/booking-workflow-form";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { eventTypeLabels } from "@/modules/bookings/schema";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking) notFound();

  const facts: { label: string; value: React.ReactNode }[] = [
    { label: "Contact", value: booking.contactName },
    { label: "Organisation", value: booking.organisation ?? "—" },
    {
      label: "Email",
      value: (
        <a href={`mailto:${booking.email}`} className="text-gold-200 hover:underline">
          {booking.email}
        </a>
      ),
    },
    { label: "Phone", value: booking.phone ?? "—" },
    { label: "Event type", value: eventTypeLabels[booking.eventType] },
    { label: "Event date", value: formatDate(booking.eventDate.toISOString()) },
    { label: "Location", value: booking.location },
    { label: "Received", value: formatDate(booking.createdAt.toISOString()) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/bookings" label="All bookings" />
        <AdminPageHeader
          title={booking.reference}
          description="Booking request detail"
          action={<StatusBadge status={booking.status} />}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,24rem)]">
        <div className="space-y-8">
          <dl className="grid gap-x-8 gap-y-4 rounded-xl border border-ink-700/70 bg-ink-900/50 p-6 sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs uppercase tracking-[0.12em] text-muted-warm">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm text-parchment">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="booking-message">
            <h2 id="booking-message" className="font-display text-lg text-parchment">
              Message
            </h2>
            <p className="mt-3 whitespace-pre-wrap rounded-xl border border-ink-700/70 bg-ink-900/50 p-6 text-sm leading-relaxed text-muted-warm">
              {booking.message}
            </p>
          </section>
        </div>

        <BookingWorkflowForm
          bookingId={booking.id}
          currentStatus={booking.status}
          adminNotes={booking.adminNotes}
        />
      </div>
    </div>
  );
}
