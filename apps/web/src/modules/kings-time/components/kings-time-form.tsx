"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ActionFeedback, type ActionResult } from "@/components/admin/primitives";
import { saveKingsTimeAction } from "@/modules/kings-time/admin-actions";

export type KingsTimeFormValues = {
  id?: string;
  title: string;
  theme: string;
  slug: string;
  description: string;
  startsAt: string;
  endsAt: string;
  scriptureReference: string;
  scriptureText: string;
  livestreamUrl: string;
  replayUrl: string;
  status: string;
  visibility: string;
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
      {pending ? "Saving…" : "Save session"}
    </Button>
  );
}

export function KingsTimeForm({ initial }: { initial: KingsTimeFormValues }) {
  const [result, formAction] = useActionState(saveKingsTimeAction, {
    status: "idle",
  } as ActionResult);

  const fieldError = (name: string) =>
    result.status === "error" ? result.fieldErrors?.[name] : undefined;

  return (
    <form action={formAction} className="max-w-3xl space-y-6" noValidate>
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <ActionFeedback result={result} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Title"
          htmlFor="kt-title"
          required
          hint="e.g. King's Time — November 2026"
          error={fieldError("title")}
        >
          {(aria) => <Input {...aria} name="title" defaultValue={initial.title} required />}
        </Field>
        <Field
          label="Theme"
          htmlFor="kt-theme"
          required
          hint="The theme of the session."
          error={fieldError("theme")}
        >
          {(aria) => <Input {...aria} name="theme" defaultValue={initial.theme} required />}
        </Field>
        <Field
          label="Slug"
          htmlFor="kt-slug"
          hint="Leave blank to generate from the title."
          error={fieldError("slug")}
        >
          {(aria) => <Input {...aria} name="slug" defaultValue={initial.slug} />}
        </Field>
        <div />
        <Field label="Starts (UTC)" htmlFor="kt-starts" required error={fieldError("startsAt")}>
          {(aria) => (
            <Input
              {...aria}
              name="startsAt"
              type="datetime-local"
              defaultValue={initial.startsAt}
              required
            />
          )}
        </Field>
        <Field label="Ends (UTC)" htmlFor="kt-ends" hint="Optional" error={fieldError("endsAt")}>
          {(aria) => (
            <Input {...aria} name="endsAt" type="datetime-local" defaultValue={initial.endsAt} />
          )}
        </Field>
        <Field label="Status" htmlFor="kt-status" error={fieldError("status")}>
          {(aria) => (
            <Select {...aria} name="status" defaultValue={initial.status}>
              <option value="SCHEDULED">Scheduled</option>
              <option value="LIVE">Live now</option>
              <option value="ENDED">Ended</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          )}
        </Field>
        <Field
          label="Visibility"
          htmlFor="kt-visibility"
          hint="Only published sessions appear on the website."
          error={fieldError("visibility")}
        >
          {(aria) => (
            <Select {...aria} name="visibility" defaultValue={initial.visibility}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          )}
        </Field>
      </div>

      <Field label="Description" htmlFor="kt-description" error={fieldError("description")}>
        {(aria) => (
          <Textarea {...aria} name="description" defaultValue={initial.description} rows={5} />
        )}
      </Field>

      <fieldset className="grid gap-6 rounded-xl border border-ink-700/70 p-5 sm:grid-cols-2">
        <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-warm">
          Scripture
        </legend>
        <Field
          label="Reference"
          htmlFor="kt-scripture-ref"
          hint="e.g. Psalm 22:3"
          error={fieldError("scriptureReference")}
        >
          {(aria) => (
            <Input {...aria} name="scriptureReference" defaultValue={initial.scriptureReference} />
          )}
        </Field>
        <Field
          label="Quoted text"
          htmlFor="kt-scripture-text"
          hint="Optional. Include the translation in the reference if quoting."
          error={fieldError("scriptureText")}
          className="sm:col-span-2"
        >
          {(aria) => (
            <Textarea {...aria} name="scriptureText" defaultValue={initial.scriptureText} rows={3} />
          )}
        </Field>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Livestream URL"
          htmlFor="kt-live"
          hint="Optional"
          error={fieldError("livestreamUrl")}
        >
          {(aria) => (
            <Input {...aria} name="livestreamUrl" type="url" defaultValue={initial.livestreamUrl} />
          )}
        </Field>
        <Field label="Replay URL" htmlFor="kt-replay" hint="Optional" error={fieldError("replayUrl")}>
          {(aria) => (
            <Input {...aria} name="replayUrl" type="url" defaultValue={initial.replayUrl} />
          )}
        </Field>
      </div>

      <SubmitButton />
    </form>
  );
}
