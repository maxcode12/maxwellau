import { z } from "zod";

export const testimonyFormSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "A display name is required.").max(160),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  quote: z.string().trim().min(10, "The quote is required.").max(600),
  body: z.string().trim().max(8000).optional().or(z.literal("")),
  sharedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the date it was shared."),
  featured: z
    .string()
    .optional()
    .transform((value) => value === "on"),
  status: z.enum(["PENDING", "APPROVED", "ARCHIVED"]),
  /**
   * Publication consent must be explicitly recorded before a testimony can be
   * approved — enforced in the action, not just the UI.
   */
  hasConsent: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});
