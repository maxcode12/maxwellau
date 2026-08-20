import "server-only";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { getCurrentUser, type SessionUser } from "@/modules/auth/session";

/**
 * Server-side authorisation guards.
 *
 * Every admin page and every admin mutation calls one of these — the
 * middleware cookie check is a UX convenience, not the security boundary.
 */

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/admin?denied=1");
  return user;
}

/** For server actions: returns null rather than redirecting, so the action can respond with a typed error. */
export async function currentUserOrNull(): Promise<SessionUser | null> {
  return getCurrentUser();
}
