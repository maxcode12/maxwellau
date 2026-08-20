import { AdminBackLink, AdminPageHeader } from "@/components/admin/primitives";
import { KingsTimeForm } from "@/modules/kings-time/components/kings-time-form";

export const dynamic = "force-dynamic";

export default function NewKingsTimePage() {
  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/kings-time" label="All sessions" />
        <AdminPageHeader title="New King's Time session" />
      </div>
      <KingsTimeForm
        initial={{
          title: "",
          theme: "",
          slug: "",
          description: "",
          startsAt: "",
          endsAt: "",
          scriptureReference: "",
          scriptureText: "",
          livestreamUrl: "",
          replayUrl: "",
          status: "SCHEDULED",
          visibility: "DRAFT",
        }}
      />
    </div>
  );
}
