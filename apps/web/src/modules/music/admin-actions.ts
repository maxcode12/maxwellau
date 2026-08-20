"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { parseForm } from "@/lib/form";
import { slugify } from "@/lib/utils";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";
import type { ActionResult } from "@/components/admin/primitives";

const dateByPrecision = {
  DAY: /^\d{4}-\d{2}-\d{2}$/,
  MONTH: /^\d{4}-\d{2}(-\d{2})?$/,
  YEAR: /^\d{4}(-\d{2}(-\d{2})?)?$/,
} as const;

function toUtcDate(value: string): Date {
  const [year, month = "01", day = "01"] = value.split("-");
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

const albumFormSchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal("")),
    title: z.string().trim().min(1, "Title is required.").max(200),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only.")
      .max(96)
      .optional()
      .or(z.literal("")),
    type: z.enum(["ALBUM", "EP", "SINGLE"]),
    releasedAt: z.string().trim().min(4, "Provide the release date."),
    releasedAtPrecision: z.enum(["DAY", "MONTH", "YEAR"]),
    description: z.string().trim().max(4000).default(""),
    tracklistComplete: z
      .string()
      .optional()
      .transform((value) => value === "on"),
    visibility: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  })
  .refine((input) => dateByPrecision[input.releasedAtPrecision].test(input.releasedAt), {
    message: "The date does not match the chosen precision.",
    path: ["releasedAt"],
  });

export async function saveAlbumAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await currentUserOrNull();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again." };

  const parsed = parseForm(albumFormSchema, formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.message, fieldErrors: parsed.fieldErrors };
  }
  const input = parsed.data;

  const data = {
    title: input.title,
    slug: input.slug || slugify(input.title),
    type: input.type,
    releasedAt: toUtcDate(input.releasedAt),
    releasedAtPrecision: input.releasedAtPrecision,
    description: input.description,
    tracklistComplete: input.tracklistComplete,
    visibility: input.visibility,
  };

  try {
    if (input.id) {
      await db.album.update({ where: { id: input.id }, data });
      await recordAudit({
        actorId: user.id,
        action: "album.updated",
        entityType: "Album",
        entityId: input.id,
        detail: { slug: data.slug },
      });
    } else {
      const created = await db.album.create({ data });
      await recordAudit({
        actorId: user.id,
        action: "album.created",
        entityType: "Album",
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

  revalidatePath("/admin/music");
  revalidatePath("/music");
  revalidatePath("/");
  return { status: "success", message: "Release saved." };
}

const songFormSchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal("")),
    albumId: z.string().uuid().optional().or(z.literal("")),
    title: z.string().trim().min(1, "Title is required.").max(240),
    trackNumber: z
      .string()
      .trim()
      .regex(/^\d*$/, "Whole number only.")
      .optional()
      .or(z.literal("")),
    durationSeconds: z
      .string()
      .trim()
      .regex(/^\d*$/, "Duration in seconds.")
      .optional()
      .or(z.literal("")),
    releasedAt: z.string().trim().min(4, "Provide the release date."),
    releasedAtPrecision: z.enum(["DAY", "MONTH", "YEAR"]),
    featured: z
      .string()
      .optional()
      .transform((value) => value === "on"),
    visibility: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  })
  .refine((input) => dateByPrecision[input.releasedAtPrecision].test(input.releasedAt), {
    message: "The date does not match the chosen precision.",
    path: ["releasedAt"],
  });

export async function saveSongAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await currentUserOrNull();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again." };

  const parsed = parseForm(songFormSchema, formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.message, fieldErrors: parsed.fieldErrors };
  }
  const input = parsed.data;

  const data = {
    title: input.title,
    albumId: input.albumId || null,
    trackNumber: input.trackNumber ? Number(input.trackNumber) : null,
    durationSeconds: input.durationSeconds ? Number(input.durationSeconds) : null,
    releasedAt: toUtcDate(input.releasedAt),
    releasedAtPrecision: input.releasedAtPrecision,
    featured: input.featured,
    visibility: input.visibility,
  };

  try {
    if (input.id) {
      await db.song.update({ where: { id: input.id }, data });
      await recordAudit({
        actorId: user.id,
        action: "song.updated",
        entityType: "Song",
        entityId: input.id,
      });
    } else {
      const created = await db.song.create({
        data: { ...data, slug: slugify(input.title) || `song-${Date.now().toString(36)}` },
      });
      await recordAudit({
        actorId: user.id,
        action: "song.created",
        entityType: "Song",
        entityId: created.id,
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "error", message: "A song with this slug already exists — rename it slightly." };
    }
    throw error;
  }

  revalidatePath("/admin/music");
  revalidatePath("/music");
  return { status: "success", message: "Song saved." };
}

export async function deleteSongAction(formData: FormData): Promise<void> {
  const user = await currentUserOrNull();
  if (!user) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const albumId = String(formData.get("albumId") ?? "");
  if (!id) return;

  await db.song.delete({ where: { id } });
  await recordAudit({
    actorId: user.id,
    action: "song.deleted",
    entityType: "Song",
    entityId: id,
  });

  revalidatePath("/admin/music");
  revalidatePath("/music");
  if (albumId) redirect(`/admin/music/${albumId}`);
}
