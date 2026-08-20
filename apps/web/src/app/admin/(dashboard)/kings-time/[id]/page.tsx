import { notFound } from "next/navigation";
import { AdminBackLink, AdminPageHeader, StatusBadge } from "@/components/admin/primitives";
import { KingsTimeForm } from "@/modules/kings-time/components/kings-time-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function toLocalInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 16) : "";
}

export default async function EditKingsTimePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const session = await db.kingsTimeSession.findUnique({ where: { id } });
  if (!session) notFound();

  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/kings-time" label="All sessions" />
        <AdminPageHeader
          title={session.title}
          description={`/${session.slug}`}
          action={<StatusBadge status={session.status} />}
        />
      </div>
      <KingsTimeForm
        initial={{
          id: session.id,
          title: session.title,
          theme: session.theme,
          slug: session.slug,
          description: session.description,
          startsAt: toLocalInput(session.startsAt),
          endsAt: toLocalInput(session.endsAt),
          scriptureReference: session.scriptureReference ?? "",
          scriptureText: session.scriptureText ?? "",
          livestreamUrl: session.livestreamUrl ?? "",
          replayUrl: session.replayUrl ?? "",
          status: session.status,
          visibility: session.visibility,
        }}
      />
    </div>
  );
}
