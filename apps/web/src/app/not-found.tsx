import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container, Section } from "@/components/common/layout-primitives";
import { buttonVariants } from "@/components/ui/button";
import { primaryNav } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Global 404. Lives at the app root (outside the public route group) so it
 * catches every unmatched URL, and renders the public chrome explicitly.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Section className="pt-40">
          <Container className="max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold-400/90">404</p>
            <h1 className="mt-4 text-balance text-4xl sm:text-5xl">This page could not be found</h1>
            <div className="mx-auto mt-6 h-px w-20 rule-gold" aria-hidden="true" />
            <p className="mt-6 leading-relaxed text-muted-warm">
              The page may have moved, or the link may be out of date. Try one of these instead.
            </p>

            <nav aria-label="Suggested pages" className="mt-9">
              <ul className="flex flex-wrap justify-center gap-2">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link
              href="/"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-8")}
            >
              Back to the home page
            </Link>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
