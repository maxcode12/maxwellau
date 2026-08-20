"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { parseForm } from "@/lib/form";
import { slugify } from "@/lib/utils";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";
import type { ActionResult } from "@/components/admin/primitives";

const sessionFormSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(2, "Title is required.").max(200),
  theme: z.string().trim().min(2, "Theme is required.").max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only.")
    .max(96)
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(8000).default(""),
  startsAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Provide the start date and time."),
  endsAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    .optional()
    .or(z.literal("")),
  scriptureReference: z.string().trim().max(200).optional().or(z.literal("")),
  scriptureText: z.string().trim().max(2000).optional().or(z.literal("")),
  livestreamUrl: z.string().trim().url("Enter a full URL.").max(500).optional().or(z.literal("")),
  replayUrl: z.string().trim().url("Enter a full URL.").max(500).optional().or(z.literal("")),
  status: z.enum(["SCHEDULED", "LIVE", "ENDED", "ARCHIVED"]),
  visibility: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function saveKingsTimeAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await currentUserOrNull();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again." };

  const parsed = parseForm(sessionFormSchema, formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.message, fieldErrors: parsed.fieldErrors };
  }
  const input = parsed.data;

  const startsAt = new Date(`${input.startsAt}:00.000Z`);
  const endsAt = input.endsAt ? new Date(`${input.endsAt}:00.000Z`) : null;
  if (endsAt && endsAt <= startsAt) {
    return {
      status: "error",
      message: "The end time must be after the start time.",
      fieldErrors: { endsAt: "Must be after the start time." },
    };
  }

  const data = {
    title: input.title,
    theme: input.theme,
    slug: input.slug || slugify(`${input.title}`),
    description: input.description,
    startsAt,
    endsAt,
    scriptureReference: input.scriptureReference || null,
    scriptureText: input.scriptureText || null,
    livestreamUrl: input.livestreamUrl || null,
    replayUrl: input.replayUrl || null,
    status: input.status,
    visibility: input.visibility,
  };

  try {
    if (input.id) {
      await db.kingsTimeSession.update({ where: { id: input.id }, data });
      await recordAudit({
        actorId: user.id,
        action: "kingstime.updated",
        entityType: "KingsTimeSession",
        entityId: input.id,
        detail: { slug: data.slug },
      });
    } else {
      const created = await db.kingsTimeSession.create({ data });
      await recordAudit({
        actorId: user.id,
        action: "kingstime.created",
        entityType: "KingsTimeSession",
        entityId: created.id,
        detail: { slug: data.slug },
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "That slug is already in use.",
        fieldErrors: { slug: "Already in use — choose another." },
      };
    }
    throw error;
  }

  revalidatePath("/admin/kings-time");
  revalidatePath("/kings-time");
  revalidatePath("/");
  return { status: "success", message: "Session saved." };
}
