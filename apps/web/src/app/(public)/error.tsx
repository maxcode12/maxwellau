"use client";

import { useEffect } from "react";
import { Container, Section } from "@/components/common/layout-primitives";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only the digest is logged from the browser — the message may carry
    // internal detail that should not be echoed back to the client console.
    if (error.digest) console.error(`Render error (digest: ${error.digest})`);
  }, [error]);

  return (
    <Section className="pt-40">
      <Container className="max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold-400/90">
          Something went wrong
        </p>
        <h1 className="mt-4 text-balance text-4xl sm:text-5xl">We hit an unexpected problem</h1>
        <div className="mx-auto mt-6 h-px w-20 rule-gold" aria-hidden="true" />
        <p className="mt-6 leading-relaxed text-muted-warm">
          The page could not be displayed. Please try again — if it keeps happening, the ministry
          team has been notified.
        </p>
        {error.digest ? (
          <p className="mt-4 text-xs text-muted-warm/70">Reference: {error.digest}</p>
        ) : null}
        <Button onClick={reset} size="lg" className="mt-8">
          Try again
        </Button>
      </Container>
    </Section>
  );
}
