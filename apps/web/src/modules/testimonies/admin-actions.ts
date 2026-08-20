"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { parseForm } from "@/lib/form";
import { slugify } from "@/lib/utils";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";
import { testimonyFormSchema } from "@/modules/testimonies/admin";
import type { ActionResult } from "@/components/admin/primitives";

export async function saveTestimonyAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await currentUserOrNull();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again." };

  const parsed = parseForm(testimonyFormSchema, formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.message, fieldErrors: parsed.fieldErrors };
  }
  const input = parsed.data;

  // A testimony can only be APPROVED once publication consent is recorded.
  if (input.status === "APPROVED" && !input.hasConsent) {
    return {
      status: "error",
      message: "A testimony cannot be approved until publication consent is confirmed.",
      fieldErrors: { hasConsent: "Confirm consent before approving." },
    };
  }

  const data = {
    name: input.name,
    location: input.location || null,
    quote: input.quote,
    body: input.body || null,
    sharedAt: new Date(`${input.sharedAt}T00:00:00.000Z`),
    featured: input.featured,
    status: input.status,
    consentAt: input.hasConsent ? new Date() : null,
  };

  try {
    if (input.id) {
      const existing = await db.testimony.findUnique({
        where: { id: input.id },
        select: { consentAt: true },
      });
      await db.testimony.update({
        where: { id: input.id },
        // Preserve the original consent timestamp once it exists.
        data: { ...data, consentAt: existing?.consentAt ?? data.consentAt },
      });
      await recordAudit({
        actorId: user.id,
        action: "testimony.updated",
        entityType: "Testimony",
        entityId: input.id,
        detail: { status: input.status },
      });
    } else {
      const created = await db.testimony.create({
        data: { ...data, slug: `${slugify(input.name)}-${Date.now().toString(36)}` },
      });
      await recordAudit({
        actorId: user.id,
        action: "testimony.created",
        entityType: "Testimony",
        entityId: created.id,
        detail: { status: input.status },
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "error", message: "A testimony with this slug already exists." };
    }
    throw error;
  }

  revalidatePath("/admin/testimonies");
  revalidatePath("/testimonies");
  revalidatePath("/");
  return { status: "success", message: "Testimony saved." };
}
