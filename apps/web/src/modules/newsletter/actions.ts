"use server";

import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpFromHeaders } from "@/lib/request";
import { newsletterSubscriptionSchema, type NewsletterFormState } from "@/modules/newsletter/schema";
import { subscribeToNewsletter } from "@/modules/newsletter/service";

export async function subscribeAction(
  _previous: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  const parsed = newsletterSubscriptionSchema.safeParse({
    email: formData.get("email") ?? "",
    website: formData.get("website") ?? "",
    consent: formData.get("consent") === "on" ? true : formData.get("consent"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted field.", fieldErrors };
  }

  // A filled honeypot is a bot. Return the success shape so the bot learns
  // nothing, but do not store anything.
  if (parsed.data.website) return { status: "success" };

  const ip = clientIpFromHeaders(await headers());
  const limit = rateLimit(`newsletter:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many attempts. Please try again a little later.",
    };
  }

  try {
    await subscribeToNewsletter(parsed.data);
    return { status: "success" };
  } catch {
    // Never surface the underlying error — it may carry connection details.
    return {
      status: "error",
      message: "Something went wrong on our side. Please try again shortly.",
    };
  }
}
