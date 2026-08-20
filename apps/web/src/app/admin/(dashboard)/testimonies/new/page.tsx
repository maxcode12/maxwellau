import { AdminBackLink, AdminPageHeader } from "@/components/admin/primitives";
import { TestimonyForm } from "@/modules/testimonies/components/testimony-form";

export const dynamic = "force-dynamic";

export default function NewTestimonyPage() {
  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/testimonies" label="All testimonies" />
        <AdminPageHeader title="New testimony" />
      </div>
      <TestimonyForm
        initial={{
          name: "",
          location: "",
          quote: "",
          body: "",
          sharedAt: "",
          featured: false,
          status: "PENDING",
          hasConsent: false,
        }}
      />
    </div>
  );
}
