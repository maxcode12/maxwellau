import type { Metadata } from "next";
import { CalendarCheck, Clock, Mail, Users } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { BookingForm } from "@/components/sections/booking-form";
import { Container, Section } from "@/components/common/layout-primitives";
import { Card } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";
import { getContactEmails } from "@/modules/settings/service";

export const metadata: Metadata = buildMetadata({
  title: "Book Ministry",
  description:
    "Invite Maxwell AU to minister at your worship night, conference, church service or concert. Send the details and the ministry team will be in touch.",
  path: "/booking",
});

const expectations = [
  {
    icon: Clock,
    title: "A response within a few days",
    body: "Every request is read. The team aims to reply within a few working days, even when a date cannot be taken.",
  },
  {
    icon: CalendarCheck,
    title: "Give as much notice as you can",
    body: "Dates are often held months ahead. The earlier the request, the more likely the date is available.",
  },
  {
    icon: Users,
    title: "Tell us about your gathering",
    body: "Expected attendance, the shape of the programme and the sound the room needs all help the team prepare well.",
  },
];

export default async function BookingPage() {
  const emails = await getContactEmails();
  return (
    <>
      <PageHero
        eyebrow="Bookings"
        title="Invite Maxwell AU to minister"
        description="Worship nights, conferences, church services, concerts and outreach. Share the details below and the ministry team will be in touch."
        imageSlug="ministering-01"
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,20rem)] lg:gap-16">
            <div>
              <h2 className="sr-only">Booking request form</h2>
              <BookingForm />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-gold-400/90">
                What to expect
              </h2>

              {expectations.map((item) => (
                <Card key={item.title} className="p-5">
                  <item.icon className="size-5 text-gold-400" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-lg leading-snug">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-warm">{item.body}</p>
                </Card>
              ))}

              {emails.bookings ? (
                <Card className="p-5">
                  <Mail className="size-5 text-gold-400" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-lg leading-snug">Prefer email?</h3>
                  <a
                    href={`mailto:${emails.bookings}`}
                    className="mt-2 inline-block text-sm text-gold-200 underline-offset-4 hover:underline"
                  >
                    {emails.bookings}
                  </a>
                </Card>
              ) : null}
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
