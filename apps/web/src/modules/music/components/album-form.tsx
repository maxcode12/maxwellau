"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ActionFeedback, type ActionResult } from "@/components/admin/primitives";
import { saveAlbumAction } from "@/modules/music/admin-actions";

export type AlbumFormValues = {
  id?: string;
  title: string;
  slug: string;
  type: string;
  releasedAt: string;
  releasedAtPrecision: string;
  description: string;
  tracklistComplete: boolean;
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
      {pending ? "Saving…" : "Save release"}
    </Button>
  );
}

export function AlbumForm({ initial }: { initial: AlbumFormValues }) {
  const [result, formAction] = useActionState(saveAlbumAction, {
    status: "idle",
  } as ActionResult);

  const fieldError = (name: string) =>
    result.status === "error" ? result.fieldErrors?.[name] : undefined;

  return (
    <form action={formAction} className="max-w-2xl space-y-6" noValidate>
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <ActionFeedback result={result} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Title" htmlFor="album-title" required error={fieldError("title")}>
          {(aria) => <Input {...aria} name="title" defaultValue={initial.title} required />}
        </Field>
        <Field
          label="Slug"
          htmlFor="album-slug"
          hint="Leave blank to generate from the title."
          error={fieldError("slug")}
        >
          {(aria) => <Input {...aria} name="slug" defaultValue={initial.slug} />}
        </Field>
        <Field label="Type" htmlFor="album-type" error={fieldError("type")}>
          {(aria) => (
            <Select {...aria} name="type" defaultValue={initial.type}>
              <option value="ALBUM">Album</option>
              <option value="EP">EP</option>
              <option value="SINGLE">Single</option>
            </Select>
          )}
        </Field>
        <Field
          label="Visibility"
          htmlFor="album-visibility"
          hint="Only published releases appear on the website."
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
        <Field
          label="Release date"
          htmlFor="album-released"
          required
          hint="YYYY, YYYY-MM or YYYY-MM-DD to match the precision."
          error={fieldError("releasedAt")}
        >
          {(aria) => <Input {...aria} name="releasedAt" defaultValue={initial.releasedAt} required />}
        </Field>
        <Field
          label="Date precision"
          htmlFor="album-precision"
          hint="How much of the date is actually known."
          error={fieldError("releasedAtPrecision")}
        >
          {(aria) => (
            <Select {...aria} name="releasedAtPrecision" defaultValue={initial.releasedAtPrecision}>
              <option value="DAY">Exact day</option>
              <option value="MONTH">Month and year</option>
              <option value="YEAR">Year only</option>
            </Select>
          )}
        </Field>
      </div>

      <Field label="Description" htmlFor="album-description" error={fieldError("description")}>
        {(aria) => (
          <Textarea {...aria} name="description" defaultValue={initial.description} rows={4} />
        )}
      </Field>

      <div className="flex items-center gap-2.5">
        <input
          id="album-complete"
          name="tracklistComplete"
          type="checkbox"
          defaultChecked={initial.tracklistComplete}
          className="size-4 rounded-xs border border-ink-600 bg-ink-900 accent-gold-400"
        />
        <label htmlFor="album-complete" className="text-sm text-parchment">
          The tracklist below is complete (enables the public track count)
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
