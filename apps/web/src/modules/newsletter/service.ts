import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import type { NewsletterSubscription } from "@/modules/newsletter/schema";

/**
 * Newsletter subscription.
 *
 * Upserts the subscriber. A previously unsubscribed address is NOT silently
 * resubscribed to SUBSCRIBED — it returns to PENDING_CONFIRMATION so consent
 * stays explicit. The double-opt-in confirmation email is wired up when an
 * email provider is configured (documented in .env.example).
 *
 * Only a one-way hash of the address is logged.
 */
export async function subscribeToNewsletter(input: NewsletterSubscription): Promise<void> {
  const now = new Date();

  await db.newsletterSubscriber.upsert({
    where: { email: input.email },
    update: {
      // Re-consent: refresh the consent timestamp; do not flip UNSUBSCRIBED
      // straight to SUBSCRIBED without a new confirmation.
      consentAt: now,
      status: "PENDING_CONFIRMATION",
      unsubscribedAt: null,
    },
    create: {
      email: input.email,
      status: "PENDING_CONFIRMATION",
      consentAt: now,
    },
  });

  console.info(
    JSON.stringify({
      event: "newsletter.subscribed",
      emailHash: createHash("sha256").update(input.email).digest("hex").slice(0, 16),
      subscribedAt: now.toISOString(),
    }),
  );
}
