"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ActionFeedback, type ActionResult } from "@/components/admin/primitives";
import { saveTestimonyAction } from "@/modules/testimonies/admin-actions";

export type TestimonyFormValues = {
  id?: string;
  name: string;
  location: string;
  quote: string;
  body: string;
  sharedAt: string;
  featured: boolean;
  status: string;
  hasConsent: boolean;
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
      {pending ? "Saving…" : "Save testimony"}
    </Button>
  );
}

export function TestimonyForm({ initial }: { initial: TestimonyFormValues }) {
  const [result, formAction] = useActionState(saveTestimonyAction, {
    status: "idle",
  } as ActionResult);

  const fieldError = (name: string) =>
    result.status === "error" ? result.fieldErrors?.[name] : undefined;

  return (
    <form action={formAction} className="max-w-2xl space-y-6" noValidate>
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <ActionFeedback result={result} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Display name"
          htmlFor="t-name"
          required
          hint="A first name or initials is fine where anonymity is requested."
          error={fieldError("name")}
        >
          {(aria) => <Input {...aria} name="name" defaultValue={initial.name} required />}
        </Field>
        <Field label="Location" htmlFor="t-location" hint="Optional" error={fieldError("location")}>
          {(aria) => <Input {...aria} name="location" defaultValue={initial.location} />}
        </Field>
        <Field label="Shared on" htmlFor="t-shared" required error={fieldError("sharedAt")}>
          {(aria) => (
            <Input {...aria} name="sharedAt" type="date" defaultValue={initial.sharedAt} required />
          )}
        </Field>
        <Field label="Status" htmlFor="t-status" error={fieldError("status")}>
          {(aria) => (
            <Select {...aria} name="status" defaultValue={initial.status}>
              <option value="PENDING">Pending review</option>
              <option value="APPROVED">Approved (public)</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          )}
        </Field>
      </div>

      <Field
        label="Pull quote"
        htmlFor="t-quote"
        required
        hint="Shown on cards and the home page."
        error={fieldError("quote")}
      >
        {(aria) => <Textarea {...aria} name="quote" defaultValue={initial.quote} rows={3} />}
      </Field>

      <Field
        label="Full account"
        htmlFor="t-body"
        hint="Optional longer version, shown on the testimony page."
        error={fieldError("body")}
      >
        {(aria) => <Textarea {...aria} name="body" defaultValue={initial.body} rows={6} />}
      </Field>

      <div className="space-y-3 rounded-xl border border-ink-700/70 p-5">
        <div className="flex items-center gap-2.5">
          <input
            id="t-consent"
            name="hasConsent"
            type="checkbox"
            defaultChecked={initial.hasConsent}
            className="size-4 rounded-xs border border-ink-600 bg-ink-900 accent-gold-400"
          />
          <label htmlFor="t-consent" className="text-sm text-parchment">
            The contributor has given permission for this to be published
          </label>
        </div>
        {fieldError("hasConsent") ? (
          <p role="alert" className="text-xs text-red-400">
            {fieldError("hasConsent")}
          </p>
        ) : null}
        <div className="flex items-center gap-2.5">
          <input
            id="t-featured"
            name="featured"
            type="checkbox"
            defaultChecked={initial.featured}
            className="size-4 rounded-xs border border-ink-600 bg-ink-900 accent-gold-400"
          />
          <label htmlFor="t-featured" className="text-sm text-parchment">
            Feature on the home page
          </label>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
