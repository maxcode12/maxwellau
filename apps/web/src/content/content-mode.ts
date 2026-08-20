/**
 * Sample content gate.
 *
 * Phase 1 ships the public website before the CMS and database exist (Phases
 * 2–3). To make the design reviewable end-to-end without inventing facts about
 * the ministry, every module can fall back to clearly-labelled sample records.
 *
 * Every sample record carries `isSample: true`. Nothing marked as sample should
 * ever be presented as a real release, event, testimony or date.
 *
 * Turn it off with `NEXT_PUBLIC_SAMPLE_CONTENT=off`. Once the Prisma-backed
 * services land, the module services read the database and this gate is removed.
 */
export const sampleContentEnabled = process.env.NEXT_PUBLIC_SAMPLE_CONTENT !== "off";

export const isProduction = process.env.NODE_ENV === "production";

export type Sampled = { readonly isSample: boolean };

/** Returns the sample records only when the gate is open. */
export function withSamples<T>(samples: readonly T[]): readonly T[] {
  return sampleContentEnabled ? samples : [];
}
