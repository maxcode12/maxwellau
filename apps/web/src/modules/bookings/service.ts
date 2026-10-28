import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/modules/email/service";
import { getContactEmails } from "@/modules/settings/service";
import type { BookingRequest, BookingStatus } from "@/modules/bookings/schema";

export type StoredBooking = {
  readonly id: string;
  readonly reference: string;
  readonly status: BookingStatus;
  readonly receivedAt: string;
};

/**
 * Persist a public booking request.
 *
 * Only non-sensitive facts (reference, event type/date) are logged — the
 * message body, email and phone are private correspondence and CLAUDE.md
 * forbids logging sensitive form contents. Admin notification lands in Phase 3
 * alongside the booking inbox.
 */
export async function createBooking(input: BookingRequest): Promise<StoredBooking> {
  const reference = buildReference(randomUUID());

  const booking = await db.booking.create({
    data: {
      reference,
      contactName: input.contactName,
      organisation: input.organisation || null,
      email: input.email,
      phone: input.phone || null,
      eventType: input.eventType,
      eventDate: new Date(`${input.eventDate}T00:00:00.000Z`),
      location: input.location,
      message: input.message,
      status: "NEW",
    },
    select: { id: true, reference: true, status: true, createdAt: true },
  });

  console.info(
    JSON.stringify({
      event: "booking.received",
      reference: booking.reference,
      eventType: input.eventType,
      eventDate: input.eventDate,
      receivedAt: booking.createdAt.toISOString(),
    }),
  );

  await notifyMinistry(booking.reference, input);

  return {
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    receivedAt: booking.createdAt.toISOString(),
  };
}

/**
 * Email the ministry's bookings inbox. Best-effort: the booking is already
 * stored, so a missing address or a provider failure must never surface to the
 * visitor. Reply-To is the requester so the ministry can answer directly.
 */
async function notifyMinistry(reference: string, input: BookingRequest): Promise<void> {
  const { bookings } = await getContactEmails();
  if (!bookings) return;

  await sendEmail({
    to: bookings,
    replyTo: input.email,
    subject: `New booking request ${reference} — ${input.eventType}`,
    text: [
      `Reference: ${reference}`,
      `From: ${input.contactName}${input.organisation ? ` (${input.organisation})` : ""}`,
      `Email: ${input.email}`,
      input.phone ? `Phone: ${input.phone}` : null,
      `Event: ${input.eventType} on ${input.eventDate}`,
      `Location: ${input.location}`,
      "",
      input.message,
    ]
      .filter((line): line is string => line !== null)
      .join("\n"),
  });
}

/** Short, human-quotable reference derived from a UUID. */
function buildReference(id: string): string {
  return `MAU-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
