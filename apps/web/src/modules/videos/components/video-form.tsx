"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ActionFeedback, type ActionResult } from "@/components/admin/primitives";
import { saveVideoAction } from "@/modules/videos/admin-actions";
import { videoCategoryLabels } from "@/modules/videos/types";

export type VideoFormValues = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  publishedAt: string;
  youtubeId: string;
  durationSeconds: string;
  featured: boolean;
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
      {pending ? "Saving…" : "Save video"}
    </Button>
  );
}

export function VideoForm({ initial }: { initial: VideoFormValues }) {
  const [result, formAction] = useActionState(saveVideoAction, {
    status: "idle",
  } as ActionResult);

  const fieldError = (name: string) =>
    result.status === "error" ? result.fieldErrors?.[name] : undefined;

  return (
    <form action={formAction} className="max-w-2xl space-y-6" noValidate>
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <ActionFeedback result={result} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Title" htmlFor="video-title" required error={fieldError("title")}>
          {(aria) => <Input {...aria} name="title" defaultValue={initial.title} required />}
        </Field>
        <Field
          label="Slug"
          htmlFor="video-slug"
          hint="Leave blank to generate from the title."
          error={fieldError("slug")}
        >
          {(aria) => <Input {...aria} name="slug" defaultValue={initial.slug} />}
        </Field>
        <Field label="Category" htmlFor="video-category" error={fieldError("category")}>
          {(aria) => (
            <Select {...aria} name="category" defaultValue={initial.category}>
              {Object.entries(videoCategoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field
          label="Published (UTC)"
          htmlFor="video-published"
          required
          error={fieldError("publishedAt")}
        >
          {(aria) => (
            <Input
              {...aria}
              name="publishedAt"
              type="datetime-local"
              defaultValue={initial.publishedAt}
              required
            />
          )}
        </Field>
        <Field
          label="YouTube video id"
          htmlFor="video-youtube"
          hint="The id only, e.g. dQw4w9WgXcQ — not the full URL. Leave blank if not on YouTube."
          error={fieldError("youtubeId")}
        >
          {(aria) => <Input {...aria} name="youtubeId" defaultValue={initial.youtubeId} />}
        </Field>
        <Field
          label="Duration (seconds)"
          htmlFor="video-duration"
          hint="Optional"
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
        <Field
          label="Visibility"
          htmlFor="video-visibility"
          hint="Only published videos appear on the website."
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
        <div className="flex items-end pb-3">
          <div className="flex items-center gap-2.5">
            <input
              id="video-featured"
              name="featured"
              type="checkbox"
              defaultChecked={initial.featured}
              className="size-4 rounded-xs border border-ink-600 bg-ink-900 accent-gold-400"
            />
            <label htmlFor="video-featured" className="text-sm text-parchment">
              Feature on the home page
            </label>
          </div>
        </div>
      </div>

      <Field label="Description" htmlFor="video-description" error={fieldError("description")}>
        {(aria) => (
          <Textarea {...aria} name="description" defaultValue={initial.description} rows={5} />
        )}
      </Field>

      <SubmitButton />
    </form>
  );
}
