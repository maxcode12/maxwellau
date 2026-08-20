"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { subscribeAction } from "@/modules/newsletter/actions";
import type { NewsletterFormState } from "@/modules/newsletter/schema";

const initialState: NewsletterFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="sm:w-auto">
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {pending ? "Joining…" : "Join"}
    </Button>
  );
}

export function NewsletterForm({ id = "newsletter" }: { id?: string }) {
  const [state, formAction] = useActionState(subscribeAction, initialState);
  const emailId = `${id}-email`;
  const consentId = `${id}-consent`;

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-lg border border-gold-500/40 bg-gold-400/10 px-4 py-3 text-sm text-gold-100"
      >
        <Check className="size-4 shrink-0" aria-hidden="true" />
        Thank you — you&rsquo;re on the list. Watch your inbox for updates.
      </p>
    );
  }

  const emailError = state.status === "error" ? state.fieldErrors?.email : undefined;
  const consentError = state.status === "error" ? state.fieldErrors?.consent : undefined;

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={emailId} className="sr-only">
            Email address
          </label>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? `${emailId}-error` : undefined}
          />
        </div>
        <SubmitButton />
      </div>

      {/* Honeypot — hidden from sighted users and from assistive technology. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex items-start gap-2.5">
        <input
          id={consentId}
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 size-4 shrink-0 rounded-xs border border-ink-600 bg-ink-900 accent-gold-400"
          aria-invalid={consentError ? true : undefined}
          aria-describedby={consentError ? `${consentId}-error` : undefined}
        />
        <label htmlFor={consentId} className="text-xs leading-relaxed text-muted-warm">
          Yes, send me news about new music, King&rsquo;s Time and upcoming events. You can
          unsubscribe at any time.
        </label>
      </div>

      {emailError ? (
        <p id={`${emailId}-error`} role="alert" className="text-xs text-red-400">
          {emailError}
        </p>
      ) : null}
      {consentError ? (
        <p id={`${consentId}-error`} role="alert" className="text-xs text-red-400">
          {consentError}
        </p>
      ) : null}
      {state.status === "error" && !emailError && !consentError ? (
        <p role="alert" className="text-xs text-red-400">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
