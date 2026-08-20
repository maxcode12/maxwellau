"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentUserOrNull } from "@/modules/auth/guards";
import { recordAudit } from "@/modules/audit/service";

export async function disconnectAccountAction(formData: FormData): Promise<void> {
  const user = await currentUserOrNull();
  if (!user || user.role !== "ADMIN") return;

  const accountId = String(formData.get("accountId") ?? "");
  if (!accountId) return;

  // Tokens are destroyed, not merely flagged — a disconnected account keeps
  // its publication history but can never publish again until reconnected.
  await db.socialAccount.update({
    where: { id: accountId },
    data: {
      status: "DISCONNECTED",
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      accessTokenExpiresAt: null,
    },
  });

  await recordAudit({
    actorId: user.id,
    action: "social.account_disconnected",
    entityType: "SocialAccount",
    entityId: accountId,
  });

  revalidatePath("/admin/social-accounts");
}
