import { Container, Section } from "@/components/common/layout-primitives";

/** Neutral skeleton that matches the interior page rhythm without flashing. */
export default function Loading() {
  return (
    <Section className="pt-40" aria-busy="true" aria-live="polite">
      <Container>
        <span className="sr-only">Loading…</span>
        <div className="h-3 w-24 animate-pulse rounded-full bg-ink-700" />
        <div className="mt-6 h-12 w-2/3 animate-pulse rounded-lg bg-ink-800" />
        <div className="mt-4 h-px w-20 bg-ink-700" />
        <div className="mt-6 h-4 w-full max-w-xl animate-pulse rounded bg-ink-800" />
        <div className="mt-3 h-4 w-3/4 max-w-lg animate-pulse rounded bg-ink-800" />

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-4">
              <div className="aspect-video animate-pulse rounded-lg bg-ink-800" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-ink-800" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-ink-800" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
