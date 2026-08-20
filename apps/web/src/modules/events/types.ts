import type { Sampled } from "@/content/content-mode";

export type EventStatus = "SCHEDULED" | "POSTPONED" | "CANCELLED";

export type EventLocation = {
  readonly venue: string;
  readonly addressLine: string | null;
  readonly city: string;
  readonly country: string;
  /** ISO 3166-1 alpha-2, used for structured data. */
  readonly countryCode: string;
};

export type MinistryEvent = Sampled & {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** UTC ISO-8601. */
  readonly startsAt: string;
  readonly endsAt: string | null;
  readonly location: EventLocation | null;
  /** True when the event is streamed rather than in-person. */
  readonly isOnline: boolean;
  readonly imageSlug: string | null;
  readonly ticketUrl: string | null;
  readonly isFree: boolean;
  readonly status: EventStatus;
};
