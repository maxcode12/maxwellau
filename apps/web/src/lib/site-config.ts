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
  | "twitter"
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
  {
    platform: "youtube",
    label: "YouTube",
    url: "https://www.youtube.com/@maxwellau7355",
    kind: "social",
  },
  {
    platform: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/imaxwellau/",
    kind: "social",
  },
  {
    platform: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/maxwellaumusic",
    kind: "social",
  },
  {
    platform: "twitter",
    label: "X",
    url: "https://twitter.com/Maxwell_A_U",
    kind: "social",
  },
  { platform: "tiktok", label: "TikTok", url: "", kind: "social" },
  {
    platform: "spotify",
    label: "Spotify",
    url: "https://open.spotify.com/artist/2nuUncmBsgPq5iLFQhnn65",
    kind: "streaming",
  },
  {
    platform: "appleMusic",
    label: "Apple Music",
    url: "https://music.apple.com/us/artist/maxwell-au/776007996",
    kind: "streaming",
  },
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
  /**
   * Source: the public "Booking info" address on the ministry's Instagram
   * bio (@imaxwellau), read 2026-08-27. No separate press address has been
   * published, so `press` stays empty until one is.
   */
  email: {
    general: "hissoundmedia@gmail.com",
    bookings: "hissoundmedia@gmail.com",
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
