import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-700/70 pb-6">
      <div>
        <h1 className="font-display text-2xl text-parchment sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-muted-warm">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminTable({
  headers,
  children,
  caption,
}: {
  headers: readonly string[];
  children: React.ReactNode;
  caption: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-700/70">
      <table className="w-full min-w-[40rem] text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-ink-700/70 bg-ink-900/70 text-left">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-warm"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-700/50">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminEmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-muted-warm">
        {message}
      </td>
    </tr>
  );
}

const statusTones: Record<string, string> = {
  // Generic tones keyed by semantic bucket.
  positive: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  active: "border-gold-500/40 bg-gold-400/10 text-gold-200",
  neutral: "border-ink-600 bg-ink-800 text-muted-warm",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  negative: "border-red-500/40 bg-red-500/10 text-red-300",
};

export const statusToneMap: Record<string, keyof typeof statusTones> = {
  // Bookings
  NEW: "active",
  REVIEWING: "warning",
  CONTACTED: "warning",
  CONFIRMED: "positive",
  DECLINED: "negative",
  CLOSED: "neutral",
  // Visibility
  DRAFT: "neutral",
  PUBLISHED: "positive",
  ARCHIVED: "neutral",
  // Testimonies
  PENDING: "warning",
  APPROVED: "positive",
  // Events
  SCHEDULED: "active",
  POSTPONED: "warning",
  CANCELLED: "negative",
  // Publications
  QUEUED: "warning",
  PROCESSING: "warning",
  FAILED: "negative",
  // Social accounts / newsletter
  CONNECTED: "positive",
  EXPIRED: "warning",
  REVOKED: "negative",
  DISCONNECTED: "neutral",
  SUBSCRIBED: "positive",
  PENDING_CONFIRMATION: "warning",
  UNSUBSCRIBED: "neutral",
  LIVE: "negative",
  ENDED: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = statusTones[statusToneMap[status] ?? "neutral"];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em]",
        tone,
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-warm transition-colors hover:text-gold-200"
    >
      ← {label}
    </Link>
  );
}

/** Standard result shape for admin server actions. */
export type ActionResult =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<string, string>> };

export function ActionFeedback({ result }: { result: ActionResult }) {
  if (result.status === "idle") return null;
  if (result.status === "success") {
    return (
      <p
        role="status"
        className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
      >
        {result.message ?? "Saved."}
      </p>
    );
  }
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200"
    >
      {result.message}
    </p>
  );
}
