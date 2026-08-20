"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ActionFeedback, type ActionResult } from "@/components/admin/primitives";
import { saveSongAction } from "@/modules/music/admin-actions";

export type SongFormValues = {
  id?: string;
  albumId: string;
  title: string;
  trackNumber: string;
  durationSeconds: string;
  releasedAt: string;
  releasedAtPrecision: string;
  featured: boolean;
  visibility: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Save aria-hidden="true" />
      )}
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function SongForm({ initial, submitLabel = "Save song" }: { initial: SongFormValues; submitLabel?: string }) {
  const [result, formAction] = useActionState(saveSongAction, {
    status: "idle",
  } as ActionResult);

  const fieldError = (name: string) =>
    result.status === "error" ? result.fieldErrors?.[name] : undefined;

  const prefix = initial.id ?? "new";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="albumId" value={initial.albumId} />
      <ActionFeedback result={result} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Title"
          htmlFor={`song-title-${prefix}`}
          required
          error={fieldError("title")}
          className="sm:col-span-2 lg:col-span-3"
        >
          {(aria) => <Input {...aria} name="title" defaultValue={initial.title} required />}
        </Field>
        <Field label="Track #" htmlFor={`song-track-${prefix}`} error={fieldError("trackNumber")}>
          {(aria) => (
            <Input {...aria} name="trackNumber" inputMode="numeric" defaultValue={initial.trackNumber} />
          )}
        </Field>
        <Field
          label="Duration (seconds)"
          htmlFor={`song-duration-${prefix}`}
          error={fieldError("durationSeconds")}
        >
          {(aria) => (
            <Input
              {...aria}
              name="durationSeconds"
              inputMode="numeric"
              defaultValue={initial.durationSeconds}
            />
          )}
        </Field>
        <Field label="Visibility" htmlFor={`song-visibility-${prefix}`} error={fieldError("visibility")}>
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
          htmlFor={`song-released-${prefix}`}
          required
          hint="YYYY, YYYY-MM or YYYY-MM-DD"
          error={fieldError("releasedAt")}
        >
          {(aria) => <Input {...aria} name="releasedAt" defaultValue={initial.releasedAt} required />}
        </Field>
        <Field
          label="Date precision"
          htmlFor={`song-precision-${prefix}`}
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
        <div className="flex items-end pb-3">
          <div className="flex items-center gap-2.5">
            <input
              id={`song-featured-${prefix}`}
              name="featured"
              type="checkbox"
              defaultChecked={initial.featured}
              className="size-4 rounded-xs border border-ink-600 bg-ink-900 accent-gold-400"
            />
            <label htmlFor={`song-featured-${prefix}`} className="text-sm text-parchment">
              Featured
            </label>
          </div>
        </div>
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
