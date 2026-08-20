import { AdminBackLink, AdminPageHeader } from "@/components/admin/primitives";
import { EventForm } from "@/modules/events/components/event-form";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/events" label="All events" />
        <AdminPageHeader title="New event" />
      </div>
      <EventForm
        initial={{
          title: "",
          slug: "",
          description: "",
          startsAt: "",
          endsAt: "",
          isOnline: false,
          venue: "",
          addressLine: "",
          city: "",
          country: "",
          countryCode: "",
          ticketUrl: "",
          isFree: true,
          status: "SCHEDULED",
          visibility: "DRAFT",
        }}
      />
    </div>
  );
}
