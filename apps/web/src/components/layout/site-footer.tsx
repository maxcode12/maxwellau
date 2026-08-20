import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { PlatformIcon } from "@/components/common/platform-icon";
import { NewsletterForm } from "@/components/sections/newsletter-form";
import { Container } from "@/components/common/layout-primitives";
import { configuredLinks, primaryNav, secondaryNav, siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const socials = configuredLinks("social");
  const year = new Date().getUTCFullYear();

  return (
    <footer className="relative border-t border-ink-700/70 bg-ink-900">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px rule-gold"
      />

      <Container className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 lg:col-span-5">
          <BrandMark size="md" showTagline href={null} />
          <p className="max-w-sm text-sm leading-relaxed text-muted-warm">
            {siteConfig.description}
          </p>

          {socials.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {socials.map((link) => (
                <li key={link.platform}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="inline-flex size-10 items-center justify-center rounded-full border border-ink-600 text-muted-warm transition-colors hover:border-gold-500/60 hover:text-gold-200"
                  >
                    <span className="sr-only">{link.label}</span>
                    <PlatformIcon platform={link.platform} className="size-4.5" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Footer" className="lg:col-span-3">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-gold-400/90">
            Explore
          </h2>
          <ul className="mt-5 space-y-2.5">
            {[...primaryNav, ...secondaryNav, { href: "/booking", label: "Booking", description: "" }].map(
              (item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-parchment/75 transition-colors hover:text-gold-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-gold-400/90">
            Stay connected
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-warm">
            New music, King&rsquo;s Time and upcoming dates — straight to your inbox.
          </p>
          <div className="mt-5">
            <NewsletterForm id="footer-newsletter" />
          </div>
        </div>
      </Container>

      <div className="border-t border-ink-700/70">
        <Container className="flex flex-col gap-3 py-6 text-xs text-muted-warm sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="tracking-[0.18em] uppercase">{siteConfig.tagline}</p>
        </Container>
      </div>
    </footer>
  );
}
