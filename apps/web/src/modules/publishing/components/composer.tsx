"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ActionFeedback, type ActionResult } from "@/components/admin/primitives";
import { createPostAction } from "@/modules/publishing/admin-actions";

export type ComposerMedia = { id: string; title: string; type: string };
export type ComposerAccount = {
  id: string;
  platform: string;
  displayName: string;
  /** Human note when the platform cannot take this media kind. */
  limitation: string | null;
};

export function Composer({
  mediaOptions,
  accounts,
}: {
  mediaOptions: ComposerMedia[];
  accounts: ComposerAccount[];
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [mediaId, setMediaId] = React.useState("");
  const [publishToWebsite, setPublishToWebsite] = React.useState(true);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [overrides, setOverrides] = React.useState<Record<string, string>>({});
  const [mode, setMode] = React.useState<"now" | "schedule">("now");
  const [scheduledFor, setScheduledFor] = React.useState("");
  const [result, setResult] = React.useState<ActionResult>({ status: "idle" });
  const [pending, startTransition] = React.useTransition();

  const toggleAccount = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    startTransition(async () => {
      const response = await createPostAction({
        title,
        description,
        mediaId,
        publishToWebsite,
        accountIds: [...selected],
        captionOverrides: Object.fromEntries(
          Object.entries(overrides).filter(([id, value]) => selected.has(id) && value.trim()),
        ),
        mode,
        scheduledFor: scheduledFor ? `${scheduledFor}:00.000Z` : "",
      });
      setResult(response);
      if (response.status === "success") {
        router.push("/admin/publishing");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <ActionFeedback result={result} />

      <Field label="Video / media" htmlFor="composer-media" hint="Files from the media library (uploaded via Media Library).">
        {(aria) => (
          <Select {...aria} value={mediaId} onChange={(event) => setMediaId(event.target.value)}>
            <option value="">No media (text-only where supported)</option>
            {mediaOptions.map((media) => (
              <option key={media.id} value={media.id}>
                {media.title} ({media.type.toLowerCase()})
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Title" htmlFor="composer-title" required>
        {(aria) => (
          <Input {...aria} value={title} onChange={(event) => setTitle(event.target.value)} required />
        )}
      </Field>

      <Field
        label="Description"
        htmlFor="composer-description"
        hint="Used as the caption everywhere unless a destination has its own override below."
      >
        {(aria) => (
          <Textarea
            {...aria}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
          />
        )}
      </Field>

      <fieldset className="space-y-3 rounded-xl border border-ink-700/70 p-5">
        <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-warm">
          Destinations
        </legend>

        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={publishToWebsite}
            onChange={(event) => setPublishToWebsite(event.target.checked)}
            className="size-4 rounded-xs border border-ink-600 bg-ink-900 accent-gold-400"
          />
          <span className="text-sm text-parchment">Website (maxwellau.com)</span>
        </label>

        {accounts.length === 0 ? (
          <p className="text-sm text-muted-warm">
            No social accounts are connected yet — connect them under{" "}
            <span className="text-gold-200">Social Accounts</span>.
          </p>
        ) : (
          accounts.map((account) => (
            <label key={account.id} className="flex items-start gap-2.5">
              <input
                type="checkbox"
                checked={selected.has(account.id)}
                disabled={Boolean(account.limitation)}
                onChange={() => toggleAccount(account.id)}
                className="mt-0.5 size-4 rounded-xs border border-ink-600 bg-ink-900 accent-gold-400"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-parchment">
                  {account.platform} — {account.displayName}
                </span>
                {account.limitation ? (
                  <span className="block text-xs text-amber-300">{account.limitation}</span>
                ) : null}
                {selected.has(account.id) ? (
                  <textarea
                    aria-label={`Caption override for ${account.platform}`}
                    placeholder="Optional caption override for this platform…"
                    value={overrides[account.id] ?? ""}
                    onChange={(event) =>
                      setOverrides((current) => ({ ...current, [account.id]: event.target.value }))
                    }
                    rows={2}
                    className="mt-2 w-full rounded-md border border-ink-600 bg-ink-900/80 px-3 py-2 text-xs text-parchment placeholder:text-muted-warm/60 focus:border-gold-400 focus:outline-none"
                  />
                ) : null}
              </span>
            </label>
          ))
        )}
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-ink-700/70 p-5">
        <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-warm">
          Publishing
        </legend>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-parchment">
            <input
              type="radio"
              name="mode"
              checked={mode === "now"}
              onChange={() => setMode("now")}
              className="accent-gold-400"
            />
            Publish now
          </label>
          <label className="flex items-center gap-2 text-sm text-parchment">
            <input
              type="radio"
              name="mode"
              checked={mode === "schedule"}
              onChange={() => setMode("schedule")}
              className="accent-gold-400"
            />
            Schedule
          </label>
        </div>

        {mode === "schedule" ? (
          <Field label="Publish at (UTC)" htmlFor="composer-schedule" required>
            {(aria) => (
              <Input
                {...aria}
                type="datetime-local"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
                required
              />
            )}
          </Field>
        ) : null}
      </fieldset>

      <Button onClick={submit} disabled={pending || !title.trim()} size="lg">
        {pending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : mode === "schedule" ? (
          <CalendarClock aria-hidden="true" />
        ) : (
          <Send aria-hidden="true" />
        )}
        {pending ? "Working…" : mode === "schedule" ? "Schedule post" : "Publish"}
      </Button>
    </div>
  );
}
