/**
 * Single source of truth for site-wide identity, navigation and outbound links.
 *
 * Values marked `TODO: OWNER` are not yet known. They are intentionally left
 * empty rather than guessed — the UI hides or disables anything unconfigured,
 * so filling one in here is all that is needed to make it live. In a later
 * phase these move into the `SiteSetting` table and become admin-editable.
 */

export type SocialPlatform =
  | "youtube"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "spotify"
  | "appleMusic"
  | "audiomack"
  | "boomplay";

export type SocialLink = {
  readonly platform: SocialPlatform;
  readonly label: string;
  /** Empty string means "not configured yet" — the UI degrades gracefully. */
  readonly url: string;
  readonly handle?: string;
  readonly kind: "social" | "streaming";
};

export const socialLinks: readonly SocialLink[] = [
  { platform: "youtube", label: "YouTube", url: "", kind: "social" },
  { platform: "instagram", label: "Instagram", url: "", kind: "social" },
  { platform: "facebook", label: "Facebook", url: "", kind: "social" },
  { platform: "tiktok", label: "TikTok", url: "", kind: "social" },
  { platform: "spotify", label: "Spotify", url: "", kind: "streaming" },
  { platform: "appleMusic", label: "Apple Music", url: "", kind: "streaming" },
  { platform: "audiomack", label: "Audiomack", url: "", kind: "streaming" },
  { platform: "boomplay", label: "Boomplay", url: "", kind: "streaming" },
] as const;

export function configuredLinks(kind?: SocialLink["kind"]): SocialLink[] {
  return socialLinks.filter((link) => link.url !== "" && (kind ? link.kind === kind : true));
}

export type NavItem = {
  readonly href: string;
  readonly label: string;
  readonly description: string;
};

export const primaryNav: readonly NavItem[] = [
  { href: "/music", label: "Music", description: "Releases, singles and where to listen." },
  { href: "/videos", label: "Videos", description: "Worship sessions, live sets and visuals." },
  { href: "/kings-time", label: "King's Time", description: "Monthly worship and prayer encounter." },
  { href: "/events", label: "Events", description: "Where Maxwell AU is ministering next." },
  { href: "/testimonies", label: "Testimonies", description: "What God has done through the ministry." },
  { href: "/bio", label: "Bio", description: "The story behind the ministry." },
] as const;

export const secondaryNav: readonly NavItem[] = [
  { href: "/media", label: "Media & Press", description: "Photography and press resources." },
  { href: "/contact", label: "Contact", description: "General enquiries." },
] as const;

export const siteConfig = {
  name: "Maxwell AU",
  shortName: "Maxwell AU",
  tagline: "Worship • Encounter • Transformation",
  description:
    "Maxwell AU is a singer-songwriter, recording artist and worship minister, blending contemporary Christian worship with the richness of African music. Listen to the music, watch worship sessions, join King's Time and request ministry bookings.",
  /**
   * Canonical production host. Overridable per-environment so preview builds
   * emit their own absolute URLs instead of pointing at production.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maxwellau.com",
  locale: "en_GB",
  /** TODO: OWNER — replace with the real ministry enquiry addresses. */
  email: {
    general: "",
    bookings: "",
    press: "",
  },
  brand: {
    lockup: "/brand/maxwellau-lockup.png",
    mark: "/brand/maxwellau-mark.png",
  },
} as const;

export function absoluteUrl(pathname = "/"): string {
  const base = siteConfig.url.replace(/\/+$/, "");
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
