"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ActionFeedback, type ActionResult } from "@/components/admin/primitives";
import { saveProfileAction } from "@/modules/profile/admin-actions";

export type ProfileFormValues = {
  role: string;
  tagline: string;
  summary: string;
  sections: { id: string; heading: string; text: string }[];
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
      {pending ? "Saving…" : "Save profile"}
    </Button>
  );
}

export function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const [result, formAction] = useActionState(saveProfileAction, {
    status: "idle",
  } as ActionResult);

  const fieldError = (name: string) =>
    result.status === "error" ? result.fieldErrors?.[name] : undefined;

  return (
    <form action={formAction} className="max-w-3xl space-y-6" noValidate>
      <ActionFeedback result={result} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Role line" htmlFor="profile-role" required error={fieldError("role")}>
          {(aria) => <Input {...aria} name="role" defaultValue={initial.role} required />}
        </Field>
        <Field label="Tagline" htmlFor="profile-tagline" required error={fieldError("tagline")}>
          {(aria) => <Input {...aria} name="tagline" defaultValue={initial.tagline} required />}
        </Field>
      </div>

      <Field
        label="Summary"
        htmlFor="profile-summary"
        required
        hint="One or two sentences used in the bio hero and search results."
        error={fieldError("summary")}
      >
        {(aria) => <Textarea {...aria} name="summary" defaultValue={initial.summary} rows={3} />}
      </Field>

      {initial.sections.map((section) => (
        <Field
          key={section.id}
          label={section.heading}
          htmlFor={`section-${section.id}`}
          hint="Separate paragraphs with a blank line."
        >
          {(aria) => (
            <Textarea
              {...aria}
              name={`section-${section.id}`}
              defaultValue={section.text}
              rows={6}
            />
          )}
        </Field>
      ))}

      <SubmitButton />
    </form>
  );
}
