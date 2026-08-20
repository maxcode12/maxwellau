"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { ActionFeedback, type ActionResult } from "@/components/admin/primitives";
import { saveSettingsAction } from "@/modules/settings/admin-actions";

export type SettingsFormValues = {
  links: { platform: string; label: string; kind: string; url: string }[];
  emails: { general: string; bookings: string; press: string };
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Save aria-hidden="true" />
      )}
      {pending ? "Saving…" : "Save settings"}
    </Button>
  );
}

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const [result, formAction] = useActionState(saveSettingsAction, {
    status: "idle",
  } as ActionResult);

  const fieldError = (name: string) =>
    result.status === "error" ? result.fieldErrors?.[name] : undefined;

  const social = initial.links.filter((link) => link.kind === "social");
  const streaming = initial.links.filter((link) => link.kind === "streaming");

  return (
    <form action={formAction} className="max-w-2xl space-y-8" noValidate>
      <ActionFeedback result={result} />

      <fieldset className="grid gap-6 rounded-xl border border-ink-700/70 p-5 sm:grid-cols-2">
        <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] to-muted-warm text-muted-warm">
          Social profiles
        </legend>
        {social.map((link) => (
          <Field
            key={link.platform}
            label={link.label}
            htmlFor={`link-${link.platform}`}
            hint="Full URL, or blank to hide."
            error={fieldError(`link-${link.platform}`)}
          >
            {(aria) => (
              <Input {...aria} name={`link-${link.platform}`} type="url" defaultValue={link.url} />
            )}
          </Field>
        ))}
      </fieldset>

      <fieldset className="grid gap-6 rounded-xl border border-ink-700/70 p-5 sm:grid-cols-2">
        <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-warm">
          Streaming platforms
        </legend>
        {streaming.map((link) => (
          <Field
            key={link.platform}
            label={link.label}
            htmlFor={`link-${link.platform}`}
            hint="Full URL, or blank to hide."
            error={fieldError(`link-${link.platform}`)}
          >
            {(aria) => (
              <Input {...aria} name={`link-${link.platform}`} type="url" defaultValue={link.url} />
            )}
          </Field>
        ))}
      </fieldset>

      <fieldset className="grid gap-6 rounded-xl border border-ink-700/70 p-5 sm:grid-cols-2">
        <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-warm">
          Contact emails
        </legend>
        <Field
          label="General enquiries"
          htmlFor="email-general"
          error={fieldError("email-general")}
        >
          {(aria) => (
            <Input {...aria} name="email-general" type="email" defaultValue={initial.emails.general} />
          )}
        </Field>
        <Field label="Bookings" htmlFor="email-bookings" error={fieldError("email-bookings")}>
          {(aria) => (
            <Input
              {...aria}
              name="email-bookings"
              type="email"
              defaultValue={initial.emails.bookings}
            />
          )}
        </Field>
        <Field label="Press" htmlFor="email-press" error={fieldError("email-press")}>
          {(aria) => (
            <Input {...aria} name="email-press" type="email" defaultValue={initial.emails.press} />
          )}
        </Field>
      </fieldset>

      <SubmitButton />
    </form>
  );
}
