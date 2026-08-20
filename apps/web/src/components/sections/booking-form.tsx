"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { submitBookingAction } from "@/modules/bookings/actions";
import {
  eventTypeLabels,
  eventTypes,
  type BookingFormState,
} from "@/modules/bookings/schema";

const initialState: BookingFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Send aria-hidden="true" />
      )}
      {pending ? "Sending…" : "Send request"}
    </Button>
  );
}

export function BookingForm() {
  const [state, formAction] = useActionState(submitBookingAction, initialState);
  const errorRef = React.useRef<HTMLParagraphElement>(null);

  // Move focus to the summary when a submission fails so the error is announced
  // and the user is not left at the bottom of a long form.
  React.useEffect(() => {
    if (state.status === "error") errorRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <Card className="p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto size-12 text-gold-300" aria-hidden="true" />
        <h2 className="mt-6 font-display text-2xl">Request received</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-warm">
          Thank you. The ministry team will review your request and be in touch by email. Please
          quote this reference in any correspondence:
        </p>
        <p className="mt-5 font-display text-2xl tracking-[0.14em] text-gold-200">
          {state.reference}
        </p>
      </Card>
    );
  }

  const fieldError = (name: string) =>
    state.status === "error" ? state.fieldErrors?.[name] : undefined;

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.status === "error" ? (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200 focus:outline-none"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" htmlFor="contactName" required error={fieldError("contactName")}>
          {(aria) => <Input {...aria} name="contactName" autoComplete="name" required />}
        </Field>

        <Field
          label="Church or organisation"
          htmlFor="organisation"
          hint="Optional"
          error={fieldError("organisation")}
        >
          {(aria) => <Input {...aria} name="organisation" autoComplete="organization" />}
        </Field>

        <Field label="Email" htmlFor="email" required error={fieldError("email")}>
          {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" required />}
        </Field>

        <Field label="Phone" htmlFor="phone" hint="Optional" error={fieldError("phone")}>
          {(aria) => <Input {...aria} name="phone" type="tel" autoComplete="tel" />}
        </Field>

        <Field label="Event type" htmlFor="eventType" required error={fieldError("eventType")}>
          {(aria) => (
            <Select {...aria} name="eventType" defaultValue="" required>
              <option value="" disabled>
                Choose one…
              </option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {eventTypeLabels[type]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Event date" htmlFor="eventDate" required error={fieldError("eventDate")}>
          {(aria) => <Input {...aria} name="eventDate" type="date" required />}
        </Field>
      </div>

      <Field
        label="Location"
        htmlFor="location"
        required
        hint="City and venue, or “online” if the event is streamed."
        error={fieldError("location")}
      >
        {(aria) => <Input {...aria} name="location" required />}
      </Field>

      <Field
        label="Tell us about the event"
        htmlFor="message"
        required
        hint="Expected attendance, the shape of the programme and anything else that helps the team respond well."
        error={fieldError("message")}
      >
        {(aria) => <Textarea {...aria} name="message" required minLength={10} maxLength={4000} />}
      </Field>

      {/* Honeypot — positioned off-screen and hidden from assistive technology. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="booking-website">Leave this field empty</label>
        <input id="booking-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="text-xs leading-relaxed text-muted-warm">
        Your details are used only to respond to this enquiry. They are never sold or shared.
      </p>

      <SubmitButton />
    </form>
  );
}
