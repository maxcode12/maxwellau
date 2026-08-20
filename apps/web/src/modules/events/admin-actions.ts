"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { parseForm } from "@/lib/form";
import { slugify } from "@/lib/utils";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";
import { eventFormSchema } from "@/modules/events/admin";
import type { ActionResult } from "@/components/admin/primitives";

function revalidateEventPages() {
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function saveEventAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await currentUserOrNull();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again." };

  const parsed = parseForm(eventFormSchema, formData);
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

  const slug = input.slug || slugify(input.title);

  const data = {
    title: input.title,
    slug,
    description: input.description,
    startsAt,
    endsAt,
    isOnline: input.isOnline,
    venue: input.venue || null,
    addressLine: input.addressLine || null,
    city: input.city || null,
    country: input.country || null,
    countryCode: input.countryCode || null,
    ticketUrl: input.ticketUrl || null,
    isFree: input.isFree,
    status: input.status,
    visibility: input.visibility,
  };

  try {
    if (input.id) {
      await db.event.update({ where: { id: input.id }, data });
      await recordAudit({
        actorId: user.id,
        action: "event.updated",
        entityType: "Event",
        entityId: input.id,
        detail: { slug },
      });
    } else {
      const created = await db.event.create({ data });
      await recordAudit({
        actorId: user.id,
        action: "event.created",
        entityType: "Event",
        entityId: created.id,
        detail: { slug },
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

  revalidateEventPages();
  return { status: "success", message: "Event saved." };
}

export async function archiveEventAction(formData: FormData): Promise<void> {
  const user = await currentUserOrNull();
  if (!user) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.event.update({ where: { id }, data: { visibility: "ARCHIVED" } });
  await recordAudit({
    actorId: user.id,
    action: "event.archived",
    entityType: "Event",
    entityId: id,
  });

  revalidateEventPages();
  redirect("/admin/events");
}
