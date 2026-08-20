"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ActionFeedback, type ActionResult } from "@/components/admin/primitives";
import { saveEventAction } from "@/modules/events/admin-actions";

export type EventFormValues = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  /** datetime-local format (UTC wall time): YYYY-MM-DDTHH:mm */
  startsAt: string;
  endsAt: string;
  isOnline: boolean;
  venue: string;
  addressLine: string;
  city: string;
  country: string;
  countryCode: string;
  ticketUrl: string;
  isFree: boolean;
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
      {pending ? "Saving…" : "Save event"}
    </Button>
  );
}

export function EventForm({ initial }: { initial: EventFormValues }) {
  const [result, formAction] = useActionState(saveEventAction, {
    status: "idle",
  } as ActionResult);

  const fieldError = (name: string) =>
    result.status === "error" ? result.fieldErrors?.[name] : undefined;

  return (
    <form action={formAction} className="max-w-3xl space-y-6" noValidate>
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <ActionFeedback result={result} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Title" htmlFor="event-title" required error={fieldError("title")}>
          {(aria) => <Input {...aria} name="title" defaultValue={initial.title} required />}
        </Field>

        <Field
          label="Slug"
          htmlFor="event-slug"
          hint="Leave blank to generate from the title."
          error={fieldError("slug")}
        >
          {(aria) => <Input {...aria} name="slug" defaultValue={initial.slug} />}
        </Field>

        <Field
          label="Starts (UTC)"
          htmlFor="event-starts"
          required
          error={fieldError("startsAt")}
        >
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

        <Field label="Ends (UTC)" htmlFor="event-ends" hint="Optional" error={fieldError("endsAt")}>
          {(aria) => (
            <Input {...aria} name="endsAt" type="datetime-local" defaultValue={initial.endsAt} />
          )}
        </Field>

        <Field label="Status" htmlFor="event-status" error={fieldError("status")}>
          {(aria) => (
            <Select {...aria} name="status" defaultValue={initial.status}>
              <option value="SCHEDULED">Scheduled</option>
              <option value="POSTPONED">Postponed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          )}
        </Field>

        <Field
          label="Visibility"
          htmlFor="event-visibility"
          hint="Only published events appear on the website."
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

      <Field label="Description" htmlFor="event-description" error={fieldError("description")}>
        {(aria) => (
          <Textarea {...aria} name="description" defaultValue={initial.description} rows={5} />
        )}
      </Field>

      <fieldset className="space-y-6 rounded-xl border border-ink-700/70 p-5">
        <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-warm">
          Location
        </legend>

        <div className="flex items-center gap-2.5">
          <input
            id="event-online"
            name="isOnline"
            type="checkbox"
            defaultChecked={initial.isOnline}
            className="size-4 rounded-xs border border-ink-600 bg-ink-900 accent-gold-400"
          />
          <label htmlFor="event-online" className="text-sm text-parchment">
            This event is streamed online (no physical venue)
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Venue" htmlFor="event-venue" error={fieldError("venue")}>
            {(aria) => <Input {...aria} name="venue" defaultValue={initial.venue} />}
          </Field>
          <Field label="Address line" htmlFor="event-address" error={fieldError("addressLine")}>
            {(aria) => <Input {...aria} name="addressLine" defaultValue={initial.addressLine} />}
          </Field>
          <Field label="City" htmlFor="event-city" error={fieldError("city")}>
            {(aria) => <Input {...aria} name="city" defaultValue={initial.city} />}
          </Field>
          <Field label="Country" htmlFor="event-country" error={fieldError("country")}>
            {(aria) => <Input {...aria} name="country" defaultValue={initial.country} />}
          </Field>
          <Field
            label="Country code"
            htmlFor="event-country-code"
            hint="Two letters, e.g. GB, NG, CA — used for search engine markup."
            error={fieldError("countryCode")}
          >
            {(aria) => <Input {...aria} name="countryCode" defaultValue={initial.countryCode} />}
          </Field>
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Ticket / registration URL"
          htmlFor="event-tickets"
          hint="Optional"
          error={fieldError("ticketUrl")}
        >
          {(aria) => <Input {...aria} name="ticketUrl" type="url" defaultValue={initial.ticketUrl} />}
        </Field>

        <div className="flex items-end pb-3">
          <div className="flex items-center gap-2.5">
            <input
              id="event-free"
              name="isFree"
              type="checkbox"
              defaultChecked={initial.isFree}
              className="size-4 rounded-xs border border-ink-600 bg-ink-900 accent-gold-400"
            />
            <label htmlFor="event-free" className="text-sm text-parchment">
              Free entry
            </label>
          </div>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
