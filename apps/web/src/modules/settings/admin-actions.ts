"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { socialLinks } from "@/lib/site-config";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";
import {
  CONTACT_EMAILS_KEY,
  SOCIAL_LINKS_KEY,
  contactEmailsSchema,
  saveSetting,
} from "@/modules/settings/service";
import type { ActionResult } from "@/components/admin/primitives";

const urlOrEmpty = z.string().trim().url("Enter a full URL.").max(500).or(z.literal(""));

export async function saveSettingsAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await currentUserOrNull();
  if (!user || user.role !== "ADMIN") {
    return { status: "error", message: "Only administrators can change site settings." };
  }

  // Social/streaming links — one field per known platform.
  const links: Record<string, string> = {};
  const fieldErrors: Record<string, string> = {};
  for (const link of socialLinks) {
    const value = String(formData.get(`link-${link.platform}`) ?? "").trim();
    const parsed = urlOrEmpty.safeParse(value);
    if (!parsed.success) {
      fieldErrors[`link-${link.platform}`] = "Enter a full URL (or leave blank).";
    } else {
      links[link.platform] = parsed.data;
    }
  }

  const emails = contactEmailsSchema.safeParse({
    general: String(formData.get("email-general") ?? "").trim(),
    bookings: String(formData.get("email-bookings") ?? "").trim(),
    press: String(formData.get("email-press") ?? "").trim(),
  });
  if (!emails.success) {
    for (const issue of emails.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") fieldErrors[`email-${key}`] = "Enter a valid email address.";
    }
  }

  if (Object.keys(fieldErrors).length > 0 || !emails.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  await saveSetting(SOCIAL_LINKS_KEY, links);
  await saveSetting(CONTACT_EMAILS_KEY, emails.data);

  await recordAudit({
    actorId: user.id,
    action: "settings.updated",
    entityType: "SiteSetting",
    entityId: SOCIAL_LINKS_KEY,
    detail: { keys: [SOCIAL_LINKS_KEY, CONTACT_EMAILS_KEY] },
  });

  // Settings surface across the whole public site.
  revalidatePath("/", "layout");
  return { status: "success", message: "Settings saved." };
}
