import "server-only";
import { createHash } from "node:crypto";
import type { NewsletterSubscription } from "@/modules/newsletter/schema";

/**
 * Newsletter subscription.
 *
 * Phase 1 has no database. A subscription is accepted and acknowledged; only a
 * one-way hash of the address is logged so a subscription can be confirmed as
 * received without the address itself appearing in logs.
 *
 * Phase 2/3 replace this with a `NewsletterSubscriber` upsert plus a
 * double-opt-in confirmation email.
 */
export async function subscribeToNewsletter(input: NewsletterSubscription): Promise<void> {
  console.info(
    JSON.stringify({
      event: "newsletter.subscribed",
      emailHash: createHash("sha256").update(input.email).digest("hex").slice(0, 16),
      subscribedAt: new Date().toISOString(),
    }),
  );
}
