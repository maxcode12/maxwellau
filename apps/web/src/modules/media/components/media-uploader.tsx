"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CloudUpload, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import {
  confirmUploadAction,
  requestUploadSessionAction,
} from "@/modules/media/admin-actions";
import { UPLOAD_BLOCK_SIZE, detectKind, uploadRules } from "@/modules/media/upload";

/**
 * Direct browser → Azure Blob uploader.
 *
 * Large files are uploaded as staged blocks (Put Block + Put Block List)
 * against the short-lived SAS URL issued by the server, so a dropped
 * connection retries only the failed 8MB block, never the whole file, and the
 * file never passes through the Next.js server.
 */

type Phase =
  | { name: "idle" }
  | { name: "uploading"; percent: number }
  | { name: "confirming" }
  | { name: "done" }
  | { name: "error"; message: string; canRetry: boolean };

function blockId(index: number): string {
  // Fixed-width, base64-encoded ids as the Blob API requires.
  return btoa(`block-${index.toString().padStart(8, "0")}`);
}

async function putBlock(
  uploadUrl: string,
  id: string,
  chunk: Blob,
  signal: AbortSignal,
): Promise<void> {
  const url = `${uploadUrl}&comp=block&blockid=${encodeURIComponent(id)}`;
  const attempt = () => fetch(url, { method: "PUT", body: chunk, signal });

  // One transparent retry per block before surfacing the failure.
  let response = await attempt().catch((error) => {
    if (signal.aborted) throw error;
    return null;
  });
  if (!response || !response.ok) {
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    response = await attempt();
  }
  if (!response.ok) throw new Error(`Block upload failed (${response.status}).`);
}

async function commitBlocks(
  uploadUrl: string,
  ids: string[],
  contentType: string,
  signal: AbortSignal,
): Promise<void> {
  const body = `<?xml version="1.0" encoding="utf-8"?><BlockList>${ids
    .map((id) => `<Latest>${id}</Latest>`)
    .join("")}</BlockList>`;
  const response = await fetch(`${uploadUrl}&comp=blocklist`, {
    method: "PUT",
    headers: { "x-ms-blob-content-type": contentType },
    body,
    signal,
  });
  if (!response.ok) throw new Error(`Finalising the upload failed (${response.status}).`);
}

export function MediaUploader() {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState("");
  const [altText, setAltText] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>({ name: "idle" });
  const abortRef = React.useRef<AbortController | null>(null);

  const reset = () => {
    setFile(null);
    setTitle("");
    setAltText("");
    setPhase({ name: "idle" });
  };

  const selectFile = (selected: File | null) => {
    setPhase({ name: "idle" });
    setFile(selected);
    if (selected && !title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
  };

  const clientSideProblem = (candidate: File): string | null => {
    const kind = detectKind(candidate.name, candidate.type);
    if (!kind) return "That file type is not supported (images, video or audio only).";
    if (candidate.size > uploadRules[kind].maxBytes) {
      return `That file is too large — the limit is ${Math.round(
        uploadRules[kind].maxBytes / (1024 * 1024),
      )}MB.`;
    }
    return null;
  };

  const start = async () => {
    if (!file || !title.trim()) return;

    const problem = clientSideProblem(file);
    if (problem) {
      setPhase({ name: "error", message: problem, canRetry: false });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setPhase({ name: "uploading", percent: 0 });

    try {
      const session = await requestUploadSessionAction({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        title: title.trim(),
        altText: altText.trim(),
      });
      if (!session.ok) {
        setPhase({ name: "error", message: session.message, canRetry: false });
        return;
      }

      const blockSize = session.blockSizeHint || UPLOAD_BLOCK_SIZE;
      const totalBlocks = Math.max(1, Math.ceil(file.size / blockSize));
      const ids: string[] = [];

      for (let index = 0; index < totalBlocks; index++) {
        const id = blockId(index);
        const chunk = file.slice(index * blockSize, (index + 1) * blockSize);
        await putBlock(session.sas.uploadUrl, id, chunk, controller.signal);
        ids.push(id);
        setPhase({
          name: "uploading",
          percent: Math.round(((index + 1) / totalBlocks) * 100),
        });
      }

      await commitBlocks(session.sas.uploadUrl, ids, file.type, controller.signal);

      setPhase({ name: "confirming" });
      const confirmation = await confirmUploadAction({ mediaId: session.mediaId });
      if (!confirmation.ok) {
        setPhase({ name: "error", message: confirmation.message, canRetry: true });
        return;
      }

      setPhase({ name: "done" });
      router.refresh();
    } catch (error) {
      if (controller.signal.aborted) {
        setPhase({ name: "idle" });
      } else {
        setPhase({
          name: "error",
          message:
            error instanceof Error ? error.message : "The upload failed. Check your connection.",
          canRetry: true,
        });
      }
    } finally {
      abortRef.current = null;
    }
  };

  const cancel = () => abortRef.current?.abort();

  if (phase.name === "done") {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
        <CheckCircle2 className="mx-auto size-8 text-emerald-300" aria-hidden="true" />
        <p className="mt-3 text-sm text-emerald-200">Upload complete — the file is ready to use.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
          Upload another file
        </Button>
      </div>
    );
  }

  const busy = phase.name === "uploading" || phase.name === "confirming";

  return (
    <div className="space-y-5 rounded-xl border border-ink-700/70 bg-ink-900/50 p-6">
      <Field
        label="File"
        htmlFor="media-file"
        hint="Images up to 25MB, audio up to 500MB, video up to 8GB. Uploads go directly to secure storage."
      >
        {(aria) => (
          <Input
            {...aria}
            type="file"
            accept="image/*,video/*,audio/*"
            disabled={busy}
            onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
            className="file:mr-4 file:rounded-full file:border-0 file:bg-gold-400/15 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-gold-200"
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" htmlFor="media-title" required>
          {(aria) => (
            <Input
              {...aria}
              value={title}
              disabled={busy}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          )}
        </Field>
        <Field
          label="Alt text"
          htmlFor="media-alt"
          hint="Describe the image for screen readers (images only)."
        >
          {(aria) => (
            <Input
              {...aria}
              value={altText}
              disabled={busy}
              onChange={(event) => setAltText(event.target.value)}
            />
          )}
        </Field>
      </div>

      {phase.name === "uploading" ? (
        <div>
          <div
            role="progressbar"
            aria-valuenow={phase.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Upload progress"
            className="h-2 overflow-hidden rounded-full bg-ink-700"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-[width] duration-300"
              style={{ width: `${phase.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs tabular-nums text-muted-warm">{phase.percent}% uploaded</p>
        </div>
      ) : null}

      {phase.name === "error" ? (
        <p role="alert" className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {phase.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {busy ? (
          <>
            <Button disabled>
              <Loader2 className="animate-spin" aria-hidden="true" />
              {phase.name === "confirming" ? "Finalising…" : "Uploading…"}
            </Button>
            {phase.name === "uploading" ? (
              <Button variant="subtle" onClick={cancel}>
                <X aria-hidden="true" />
                Cancel
              </Button>
            ) : null}
          </>
        ) : (
          <Button onClick={start} disabled={!file || !title.trim()}>
            {phase.name === "error" && phase.canRetry ? (
              <RotateCcw aria-hidden="true" />
            ) : (
              <CloudUpload aria-hidden="true" />
            )}
            {phase.name === "error" && phase.canRetry ? "Retry upload" : "Upload"}
          </Button>
        )}
      </div>
    </div>
  );
}
