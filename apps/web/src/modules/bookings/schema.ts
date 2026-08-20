import { z } from "zod";

export const eventTypes = [
  "WORSHIP_NIGHT",
  "CONFERENCE",
  "CHURCH_SERVICE",
  "CONCERT",
  "WEDDING",
  "OUTREACH",
  "STUDIO_SESSION",
  "OTHER",
] as const;

export type BookingEventType = (typeof eventTypes)[number];

export const eventTypeLabels: Record<BookingEventType, string> = {
  WORSHIP_NIGHT: "Worship night",
  CONFERENCE: "Conference",
  CHURCH_SERVICE: "Church service",
  CONCERT: "Concert",
  WEDDING: "Wedding",
  OUTREACH: "Outreach",
  STUDIO_SESSION: "Studio session",
  OTHER: "Something else",
};

export const bookingStatuses = [
  "NEW",
  "REVIEWING",
  "CONTACTED",
  "CONFIRMED",
  "DECLINED",
  "CLOSED",
] as const;

export type BookingStatus = (typeof bookingStatuses)[number];

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

/**
 * Public booking request. Validated identically on the client (for immediate
 * feedback) and on the server (as the actual trust boundary).
 */
export const bookingRequestSchema = z.object({
  contactName: trimmed(2, 120, "Your name"),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  phone: z
    .string()
    .trim()
    .max(32)
    .regex(/^[+0-9 ()-]*$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  eventType: z.enum(eventTypes, { errorMap: () => ({ message: "Choose an event type." }) }),
  eventDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.")
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "Choose a valid date.")
    .refine(
      (value) => Date.parse(`${value}T23:59:59Z`) >= Date.now(),
      "The event date must be in the future.",
    ),
  location: trimmed(2, 200, "Location"),
  message: trimmed(10, 4000, "A short message"),
  /**
   * Honeypot. Hidden from sighted and assistive-technology users alike, so any
   * value at all means a bot filled the form.
   *
   * It validates successfully on purpose: the action inspects it and returns
   * the ordinary success shape without storing anything, so a bot cannot learn
   * that the trap was detected by watching for a validation error.
   */
  website: z.string().max(200).optional().default(""),
});

export type BookingRequestInput = z.input<typeof bookingRequestSchema>;
export type BookingRequest = z.output<typeof bookingRequestSchema>;

export type BookingFormState =
  | { status: "idle" }
  | { status: "success"; reference: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<string, string>> };
