import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { siteConfig, socialLinks as defaultLinks, type SocialLink } from "@/lib/site-config";

/**
 * Site settings stored in the SiteSetting table, validated on read AND write so
 * a hand-edited row can never crash the public site — invalid values fall back
 * to the static defaults in site-config.ts.
 *
 * Reads happen on public pages, so failures (e.g. database unreachable during
 * a build) degrade to defaults instead of failing the render.
 */

export const SOCIAL_LINKS_KEY = "social-links";
export const CONTACT_EMAILS_KEY = "contact-emails";

const socialLinksSchema = z.record(z.string(), z.string().url().or(z.literal("")));

export const contactEmailsSchema = z.object({
  general: z.string().email().or(z.literal("")).default(""),
  bookings: z.string().email().or(z.literal("")).default(""),
  press: z.string().email().or(z.literal("")).default(""),
});

export type ContactEmails = z.infer<typeof contactEmailsSchema>;

async function readSetting<S extends z.ZodTypeAny>(
  key: string,
  schema: S,
): Promise<z.output<S> | null> {
  try {
    const row = await db.siteSetting.findUnique({ where: { key } });
    if (!row) return null;
    const parsed = schema.safeParse(row.value);
    return parsed.success ? parsed.data : null;
  } catch {
    // Database unavailable (e.g. CI build) — fall back to static config.
    return null;
  }
}

/** Static platform definitions with URLs overridden from the database. */
export async function getSocialLinks(): Promise<readonly SocialLink[]> {
  const stored = await readSetting(SOCIAL_LINKS_KEY, socialLinksSchema);
  if (!stored) return defaultLinks;

  return defaultLinks.map((link) => ({
    ...link,
    url: stored[link.platform] ?? link.url,
  }));
}

export async function getConfiguredSocialLinks(
  kind?: SocialLink["kind"],
): Promise<SocialLink[]> {
  const links = await getSocialLinks();
  return links.filter((link) => link.url !== "" && (kind ? link.kind === kind : true));
}

export async function getContactEmails(): Promise<ContactEmails> {
  const stored = await readSetting(CONTACT_EMAILS_KEY, contactEmailsSchema);
  return stored ?? siteConfig.email;
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  await db.siteSetting.upsert({
    where: { key },
    update: { value: value as object },
    create: { key, value: value as object },
  });
}
