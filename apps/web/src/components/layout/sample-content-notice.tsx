import { sampleContentEnabled, isProduction } from "@/content/content-mode";

/**
 * Non-production banner making it unmistakable when the site is showing sample
 * records rather than real ministry content. Never renders in production.
 */
export function SampleContentNotice() {
  if (isProduction || !sampleContentEnabled) return null;

  return (
    <div
      role="note"
      className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-full border border-gold-500/40 bg-ink-900/95 px-4 py-2 text-[0.6875rem] tracking-wide text-gold-200 shadow-lg backdrop-blur"
    >
      Showing sample content — set{" "}
      <code className="text-gold-100">NEXT_PUBLIC_SAMPLE_CONTENT=off</code> to hide
    </div>
  );
}
