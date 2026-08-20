import { notFound } from "next/navigation";
import { AdminBackLink, AdminPageHeader } from "@/components/admin/primitives";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/modules/events/components/event-form";
import { archiveEventAction } from "@/modules/events/admin-actions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Date -> datetime-local string in UTC (YYYY-MM-DDTHH:mm). */
function toLocalInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 16) : "";
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const event = await db.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/events" label="All events" />
        <AdminPageHeader
          title={event.title}
          description={`/${event.slug}`}
          action={
            event.visibility !== "ARCHIVED" ? (
              <form action={archiveEventAction}>
                <input type="hidden" name="id" value={event.id} />
                <Button type="submit" variant="subtle" size="sm">
                  Archive
                </Button>
              </form>
            ) : null
          }
        />
      </div>

      <EventForm
        initial={{
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description,
          startsAt: toLocalInput(event.startsAt),
          endsAt: toLocalInput(event.endsAt),
          isOnline: event.isOnline,
          venue: event.venue ?? "",
          addressLine: event.addressLine ?? "",
          city: event.city ?? "",
          country: event.country ?? "",
          countryCode: event.countryCode ?? "",
          ticketUrl: event.ticketUrl ?? "",
          isFree: event.isFree,
          status: event.status,
          visibility: event.visibility,
        }}
      />
    </div>
  );
}
