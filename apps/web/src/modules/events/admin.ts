import { z } from "zod";

export const eventFormSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(2, "Title is required.").max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only.")
    .max(96)
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(8000).default(""),
  startsAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Provide the start date and time."),
  endsAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    .optional()
    .or(z.literal("")),
  isOnline: z
    .string()
    .optional()
    .transform((value) => value === "on"),
  venue: z.string().trim().max(200).optional().or(z.literal("")),
  addressLine: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(120).optional().or(z.literal("")),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Two-letter country code, e.g. GB.")
    .optional()
    .or(z.literal("")),
  ticketUrl: z.string().trim().url("Enter a full URL.").max(500).optional().or(z.literal("")),
  isFree: z
    .string()
    .optional()
    .transform((value) => value === "on"),
  status: z.enum(["SCHEDULED", "POSTPONED", "CANCELLED"]),
  visibility: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type EventFormInput = z.input<typeof eventFormSchema>;
export type EventFormData = z.output<typeof eventFormSchema>;
