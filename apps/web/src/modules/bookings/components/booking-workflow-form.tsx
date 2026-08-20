"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";
import { ActionFeedback, type ActionResult } from "@/components/admin/primitives";
import { updateBookingAction } from "@/modules/bookings/admin-actions";
import { bookingStatuses, type BookingStatus } from "@/modules/bookings/schema";

const statusLabels: Record<BookingStatus, string> = {
  NEW: "New",
  REVIEWING: "Reviewing",
  CONTACTED: "Contacted",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  CLOSED: "Closed",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Save aria-hidden="true" />
      )}
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function BookingWorkflowForm({
  bookingId,
  currentStatus,
  adminNotes,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
  adminNotes: string;
}) {
  const [result, formAction] = useActionState(updateBookingAction, {
    status: "idle",
  } as ActionResult);

  return (
    <aside className="h-fit rounded-xl border border-ink-700/70 bg-ink-900/50 p-6 lg:sticky lg:top-24">
      <h2 className="font-display text-lg text-parchment">Workflow</h2>

      <form action={formAction} className="mt-5 space-y-5">
        <input type="hidden" name="bookingId" value={bookingId} />

        <Field label="Status" htmlFor="booking-status">
          {(aria) => (
            <Select {...aria} name="status" defaultValue={currentStatus}>
              {bookingStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field
          label="Internal notes"
          htmlFor="booking-notes"
          hint="Visible to the admin team only — never shown publicly."
        >
          {(aria) => (
            <Textarea {...aria} name="adminNotes" defaultValue={adminNotes} rows={6} />
          )}
        </Field>

        <ActionFeedback result={result} />
        <SubmitButton />
      </form>
    </aside>
  );
}
