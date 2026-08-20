import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container, Eyebrow, Section } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { getImage } from "@/lib/images";
import { cn } from "@/lib/utils";

export function BookingCta() {
  const image = getImage("worship-team-01");

  return (
    <Section className="relative isolate overflow-hidden" aria-labelledby="booking-cta-heading">
      {image ? (
        <Image
          src={image.src}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          className="-z-20 object-cover object-center opacity-30"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950 via-ink-950/85 to-ink-950"
      />

      <Container className="relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Bookings</Eyebrow>
          <h2
            id="booking-cta-heading"
            className="mt-4 text-balance text-3xl sm:text-4xl lg:text-5xl"
          >
            Invite Maxwell AU to <span className="text-foil">minister</span>
          </h2>
          <div className="mx-auto mt-4 h-px w-20 rule-gold" aria-hidden="true" />
          <p className="mt-6 text-pretty leading-relaxed text-muted-warm sm:text-lg">
            Worship nights, conferences, church services and concerts. Send the details and the
            ministry team will be in touch.
          </p>
          <Link
            href="/booking"
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-9")}
          >
            Request a booking
            <ArrowRight aria-hidden="true" />
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}
