import type { Sampled } from "@/content/content-mode";
import type { SocialPlatform } from "@/lib/site-config";

export type ReleaseType = "ALBUM" | "EP" | "SINGLE";

/**
 * How much of the release date is actually known. Older releases are sometimes
 * only known to the year; rendering "1 January 2010" for one of those would be
 * an invented fact.
 */
export type DatePrecision = "day" | "month" | "year";

export type StreamingDestination = {
  readonly platform: SocialPlatform | "youtubeMusic" | "deezer" | "other";
  readonly label: string;
  readonly url: string;
};

export type Song = Sampled & {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly albumSlug: string | null;
  readonly trackNumber: number | null;
  readonly durationSeconds: number | null;
  /** UTC ISO-8601. Unknown components are floored; see `releasedAtPrecision`. */
  readonly releasedAt: string;
  readonly releasedAtPrecision: DatePrecision;
  readonly featured: boolean;
  readonly streaming: readonly StreamingDestination[];
};

export type Album = Sampled & {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly type: ReleaseType;
  /** UTC ISO-8601. Unknown components are floored; see `releasedAtPrecision`. */
  readonly releasedAt: string;
  readonly releasedAtPrecision: DatePrecision;
  readonly description: string;
  /** Slug into the generated image manifest. Null until artwork is supplied. */
  readonly coverImageSlug: string | null;
  /**
   * False when only some tracks are known. Guards against emitting a
   * misleading track count in structured data or implying a one-track album.
   */
  readonly tracklistComplete: boolean;
  readonly streaming: readonly StreamingDestination[];
};

export type AlbumWithSongs = Album & { readonly songs: readonly Song[] };

/** Formats a release date honestly for its precision, in UTC. */
export function formatReleaseDate(
  iso: string,
  precision: DatePrecision,
  locale = "en-GB",
): string {
  const date = new Date(iso);
  const options: Intl.DateTimeFormatOptions =
    precision === "day"
      ? { day: "numeric", month: "long", year: "numeric" }
      : precision === "month"
        ? { month: "long", year: "numeric" }
        : { year: "numeric" };
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(date);
}

/** Schema.org datePublished at the correct precision. */
export function schemaReleaseDate(iso: string, precision: DatePrecision): string {
  if (precision === "day") return iso.slice(0, 10);
  if (precision === "month") return iso.slice(0, 7);
  return iso.slice(0, 4);
}
