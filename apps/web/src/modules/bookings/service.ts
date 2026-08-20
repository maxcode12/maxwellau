import "server-only";
import { randomUUID } from "node:crypto";
import type { BookingRequest, BookingStatus } from "@/modules/bookings/schema";

export type StoredBooking = BookingRequest & {
  readonly id: string;
  readonly reference: string;
  readonly status: BookingStatus;
  readonly receivedAt: string;
};

/**
 * Booking persistence.
 *
 * Phase 1 has no database, so a submission is accepted, given a reference and
 * recorded in the server log. Phase 2/3 replace the body of `createBooking`
 * with a Prisma write plus an admin notification; the call site does not change.
 *
 * Nothing here logs the message body, email address or phone number — booking
 * enquiries are private correspondence and CLAUDE.md forbids logging sensitive
 * form contents.
 */
export async function createBooking(input: BookingRequest): Promise<StoredBooking> {
  const id = randomUUID();
  const booking: StoredBooking = {
    ...input,
    id,
    reference: buildReference(id),
    status: "NEW",
    receivedAt: new Date().toISOString(),
  };

  console.info(
    JSON.stringify({
      event: "booking.received",
      reference: booking.reference,
      eventType: booking.eventType,
      eventDate: booking.eventDate,
      receivedAt: booking.receivedAt,
    }),
  );

  return booking;
}

/** Short, human-quotable reference derived from the booking id. */
function buildReference(id: string): string {
  return `MAU-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
