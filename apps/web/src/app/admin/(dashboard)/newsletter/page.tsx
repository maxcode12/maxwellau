import {
  AdminEmptyRow,
  AdminPageHeader,
  AdminTable,
  StatusBadge,
} from "@/components/admin/primitives";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const [subscribers, counts] = await Promise.all([
    db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    db.newsletterSubscriber.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (status: string) =>
    counts.find((entry) => entry.status === status)?._count ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter"
        description={`${countFor("SUBSCRIBED")} subscribed · ${countFor("PENDING_CONFIRMATION")} awaiting confirmation · ${countFor("UNSUBSCRIBED")} unsubscribed`}
      />

      <AdminTable caption="Newsletter subscribers" headers={["Email", "Status", "Consent given", "Joined"]}>
        {subscribers.length === 0 ? (
          <AdminEmptyRow colSpan={4} message="No subscribers yet." />
        ) : (
          subscribers.map((subscriber) => (
            <tr key={subscriber.id} className="transition-colors hover:bg-parchment/[0.03]">
              <td className="px-4 py-3 text-parchment">{subscriber.email}</td>
              <td className="px-4 py-3">
                <StatusBadge status={subscriber.status} />
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {formatDate(subscriber.consentAt.toISOString())}
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {formatDate(subscriber.createdAt.toISOString())}
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
