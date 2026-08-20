import { notFound } from "next/navigation";
import { AdminBackLink, AdminPageHeader, StatusBadge } from "@/components/admin/primitives";
import { TestimonyForm } from "@/modules/testimonies/components/testimony-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditTestimonyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const testimony = await db.testimony.findUnique({ where: { id } });
  if (!testimony) notFound();

  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/testimonies" label="All testimonies" />
        <AdminPageHeader
          title={testimony.name}
          description={`/${testimony.slug}`}
          action={<StatusBadge status={testimony.status} />}
        />
      </div>
      <TestimonyForm
        initial={{
          id: testimony.id,
          name: testimony.name,
          location: testimony.location ?? "",
          quote: testimony.quote,
          body: testimony.body ?? "",
          sharedAt: testimony.sharedAt.toISOString().slice(0, 10),
          featured: testimony.featured,
          status: testimony.status,
          hasConsent: testimony.consentAt !== null,
        }}
      />
    </div>
  );
}
