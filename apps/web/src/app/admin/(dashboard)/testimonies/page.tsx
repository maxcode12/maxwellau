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

export default async function AdminTestimoniesPage() {
  const testimonies = await db.testimony.findMany({
    orderBy: { sharedAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Testimonies"
        description="Stories shared with the ministry. Only approved testimonies with recorded consent appear publicly."
        action={
          <Link
            href="/admin/testimonies/new"
            className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
          >
            <Plus aria-hidden="true" />
            New testimony
          </Link>
        }
      />

      <AdminTable
        caption="Testimonies"
        headers={["Name", "Quote", "Shared", "Featured", "Status"]}
      >
        {testimonies.length === 0 ? (
          <AdminEmptyRow colSpan={5} message="No testimonies recorded yet." />
        ) : (
          testimonies.map((testimony) => (
            <tr key={testimony.id} className="transition-colors hover:bg-parchment/[0.03]">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/testimonies/${testimony.id}`}
                  className="font-medium text-gold-200 hover:underline"
                >
                  {testimony.name}
                </Link>
                {testimony.location ? (
                  <span className="block text-xs text-muted-warm">{testimony.location}</span>
                ) : null}
              </td>
              <td className="max-w-sm px-4 py-3 text-muted-warm">
                <span className="line-clamp-2">{testimony.quote}</span>
              </td>
              <td className="px-4 py-3 text-muted-warm">
                {formatDate(testimony.sharedAt.toISOString())}
              </td>
              <td className="px-4 py-3 text-muted-warm">{testimony.featured ? "Yes" : "—"}</td>
              <td className="px-4 py-3">
                <StatusBadge status={testimony.status} />
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
