import { z } from "zod";

export const newsletterSubscriptionSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  /** Honeypot — see the booking schema for the rationale. */
  website: z.string().max(200).optional().default(""),
  /**
   * Explicit opt-in. Kept as a required boolean rather than an implied consent
   * so the record of consent is unambiguous.
   */
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please confirm you would like to receive updates." }),
  }),
});

export type NewsletterSubscriptionInput = z.input<typeof newsletterSubscriptionSchema>;
export type NewsletterSubscription = z.output<typeof newsletterSubscriptionSchema>;

export type NewsletterFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<string, string>> };
