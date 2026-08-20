"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";
import { bookingStatuses } from "@/modules/bookings/schema";
import type { ActionResult } from "@/components/admin/primitives";

const updateSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(bookingStatuses),
  adminNotes: z.string().max(8000).default(""),
});

export async function updateBookingAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await currentUserOrNull();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again." };

  const parsed = updateSchema.safeParse({
    bookingId: formData.get("bookingId") ?? "",
    status: formData.get("status") ?? "",
    adminNotes: formData.get("adminNotes") ?? "",
  });
  if (!parsed.success) return { status: "error", message: "Invalid booking update." };

  const existing = await db.booking.findUnique({
    where: { id: parsed.data.bookingId },
    select: { id: true, status: true, reference: true },
  });
  if (!existing) return { status: "error", message: "This booking no longer exists." };

  await db.booking.update({
    where: { id: existing.id },
    data: { status: parsed.data.status, adminNotes: parsed.data.adminNotes },
  });

  if (existing.status !== parsed.data.status) {
    await recordAudit({
      actorId: user.id,
      action: "booking.status_changed",
      entityType: "Booking",
      entityId: existing.id,
      detail: { reference: existing.reference, from: existing.status, to: parsed.data.status },
    });
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${existing.id}`);
  return { status: "success", message: "Booking updated." };
}
