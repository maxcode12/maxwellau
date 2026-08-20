import type { Sampled } from "@/content/content-mode";

export type TestimonyStatus = "PENDING" | "APPROVED" | "ARCHIVED";

export type Testimony = Sampled & {
  readonly id: string;
  readonly slug: string;
  /** Display name. May be a first name or initials where anonymity is requested. */
  readonly name: string;
  readonly location: string | null;
  /** Short pull-quote used in cards and the home page carousel. */
  readonly quote: string;
  /** Optional longer account shown on the testimony page. */
  readonly body: string | null;
  /** UTC ISO-8601. */
  readonly sharedAt: string;
  readonly featured: boolean;
  readonly status: TestimonyStatus;
};
