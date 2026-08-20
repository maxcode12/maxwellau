"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";
import { artistProfile as staticProfile } from "@/content/bio";
import type { ActionResult } from "@/components/admin/primitives";

const profileSchema = z.object({
  summary: z.string().trim().min(10, "The summary is required.").max(1000),
  tagline: z.string().trim().min(3).max(200),
  role: z.string().trim().min(3).max(200),
});

export async function saveProfileAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await currentUserOrNull();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again." };

  const parsed = profileSchema.safeParse({
    summary: formData.get("summary") ?? "",
    tagline: formData.get("tagline") ?? "",
    role: formData.get("role") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  // Sections: one textarea per static section id; paragraphs split on blank lines.
  const sections = staticProfile.sections.map((section) => {
    const raw = String(formData.get(`section-${section.id}`) ?? "").trim();
    const paragraphs = raw
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .slice(0, 20);
    return {
      id: section.id,
      heading: section.heading,
      imageSlug: section.imageSlug,
      paragraphs: paragraphs.length > 0 ? paragraphs : [...section.paragraphs],
      awaitingOwnerContent: false,
    };
  });

  const existing = await db.artistProfile.findFirst({ select: { id: true } });
  const data = {
    name: staticProfile.name,
    role: parsed.data.role,
    tagline: parsed.data.tagline,
    summary: parsed.data.summary,
    sections,
  };

  const saved = existing
    ? await db.artistProfile.update({ where: { id: existing.id }, data })
    : await db.artistProfile.create({ data });

  await recordAudit({
    actorId: user.id,
    action: "profile.updated",
    entityType: "ArtistProfile",
    entityId: saved.id,
  });

  revalidatePath("/admin/profile");
  revalidatePath("/bio");
  revalidatePath("/");
  return { status: "success", message: "Profile saved." };
}
