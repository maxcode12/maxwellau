"use server";

import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpFromHeaders } from "@/lib/request";
import { bookingRequestSchema, type BookingFormState } from "@/modules/bookings/schema";
import { createBooking } from "@/modules/bookings/service";

/**
 * Public booking submission.
 *
 * The Zod schema is the trust boundary — the client validates the same schema
 * only to give faster feedback. Failures return sanitised messages; the
 * underlying error is never surfaced to the browser.
 */
export async function submitBookingAction(
  _previous: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const parsed = bookingRequestSchema.safeParse({
    contactName: formData.get("contactName") ?? "",
    organisation: formData.get("organisation") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    eventType: formData.get("eventType") ?? "",
    eventDate: formData.get("eventDate") ?? "",
    location: formData.get("location") ?? "",
    message: formData.get("message") ?? "",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  // Honeypot filled — silently accept without storing anything.
  if (parsed.data.website) {
    return { status: "success", reference: "MAU-RECEIVED" };
  }

  const ip = clientIpFromHeaders(await headers());
  const limit = rateLimit(`booking:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return {
      status: "error",
      message: `Too many booking requests from this connection. Please try again in about ${Math.ceil(
        limit.retryAfterSeconds / 60,
      )} minutes, or email the ministry directly.`,
    };
  }

  try {
    const booking = await createBooking(parsed.data);
    return { status: "success", reference: booking.reference };
  } catch {
    return {
      status: "error",
      message:
        "We could not submit your request just now. Please try again shortly, or contact the ministry directly.",
    };
  }
}
