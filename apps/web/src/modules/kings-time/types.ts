import type { Sampled } from "@/content/content-mode";

export type KingsTimeStatus = "SCHEDULED" | "LIVE" | "ENDED" | "ARCHIVED";

export type ScriptureReference = {
  readonly reference: string;
  /** Optional quoted text. Include the translation in the reference string. */
  readonly text: string | null;
};

/**
 * King's Time is a first-class ministry content type — a recurring worship and
 * prayer encounter — not a blog post with a tag.
 */
export type KingsTimeSession = Sampled & {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly theme: string;
  readonly description: string;
  /** UTC ISO-8601. */
  readonly startsAt: string;
  readonly endsAt: string | null;
  readonly scripture: ScriptureReference | null;
  readonly imageSlug: string | null;
  readonly livestreamUrl: string | null;
  readonly replayUrl: string | null;
  /** Slugs of related videos in the video module. */
  readonly relatedVideoSlugs: readonly string[];
  readonly status: KingsTimeStatus;
};
