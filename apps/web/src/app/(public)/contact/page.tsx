import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Mail, Newspaper, Quote } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Container, Section } from "@/components/common/layout-primitives";
import { Card } from "@/components/ui/card";
import { NewsletterForm } from "@/components/sections/newsletter-form";
import { PlatformIcon } from "@/components/common/platform-icon";
import { buttonVariants } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { getConfiguredSocialLinks, getContactEmails } from "@/modules/settings/service";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with the Maxwell AU ministry team — bookings, press and media enquiries, testimonies and general questions.",
  path: "/contact",
});

export default async function ContactPage() {
  const [socials, emails] = await Promise.all([
    getConfiguredSocialLinks("social"),
    getContactEmails(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        description="Whether you are inviting Maxwell AU to minister, writing about the ministry or simply want to share what God has done — the team would love to hear from you."
        imageSlug="fellowship-01"
      />

      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col p-6">
              <CalendarCheck className="size-6 text-gold-400" aria-hidden="true" />
              <h2 className="mt-4 font-display text-xl">Ministry bookings</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-warm">
                Worship nights, conferences, church services and concerts. The booking form captures
                everything the team needs to respond well.
              </p>
              <Link
                href="/booking"
                className={cn(buttonVariants({ variant: "primary", size: "sm" }), "mt-5 self-start")}
              >
                Request a booking
              </Link>
            </Card>

            <Card className="flex flex-col p-6">
              <Newspaper className="size-6 text-gold-400" aria-hidden="true" />
              <h2 className="mt-4 font-display text-xl">Press &amp; media</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-warm">
                Interview requests, event listings and high-resolution photography. Brand assets and
                the biography are available on the media page.
              </p>
              {emails.press ? (
                <a
                  href={`mailto:${emails.press}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-5 self-start")}
                >
                  <Mail aria-hidden="true" />
                  {emails.press}
                </a>
              ) : (
                <Link
                  href="/media"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-5 self-start")}
                >
                  Media &amp; press kit
                </Link>
              )}
            </Card>

            <Card className="flex flex-col p-6">
              <Quote className="size-6 text-gold-400" aria-hidden="true" />
              <h2 className="mt-4 font-display text-xl">Share a testimony</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-warm">
                If God has met you through this ministry, the team would be glad to hear it.
                Testimonies are only ever published with permission.
              </p>
              {emails.general ? (
                <a
                  href={`mailto:${emails.general}?subject=Testimony`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-5 self-start")}
                >
                  <Mail aria-hidden="true" />
                  Send a testimony
                </a>
              ) : (
                <Link
                  href="/testimonies"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-5 self-start")}
                >
                  Read testimonies
                </Link>
              )}
            </Card>
          </div>

          {!emails.general && !emails.press ? (
            <p className="mt-8 rounded-lg border border-dashed border-ink-600 bg-ink-900/40 px-5 py-4 text-sm text-muted-warm">
              Direct email addresses have not been published yet. In the meantime, the booking form
              reaches the ministry team for every kind of enquiry.
            </p>
          ) : null}
        </Container>
      </Section>

      <Section className="bg-ink-900/50">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl sm:text-3xl">Newsletter</h2>
            <div className="mt-4 h-px w-16 rule-gold" aria-hidden="true" />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-warm">
              New music, King&rsquo;s Time and upcoming dates — straight to your inbox, and never
              more often than there is something worth saying.
            </p>
            <div className="mt-6 max-w-md">
              <NewsletterForm id="contact-newsletter" />
            </div>
          </div>

          {socials.length > 0 ? (
            <div>
              <h2 className="text-2xl sm:text-3xl">Follow</h2>
              <div className="mt-4 h-px w-16 rule-gold" aria-hidden="true" />
              <ul className="mt-6 flex flex-wrap gap-3">
                {socials.map((link) => (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className={cn(buttonVariants({ variant: "outline", size: "md" }))}
                    >
                      <PlatformIcon platform={link.platform} className="size-4" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
