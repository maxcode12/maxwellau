"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpFromHeaders } from "@/lib/request";
import { recordAudit } from "@/modules/audit/service";
import {
  createSession,
  destroyCurrentSession,
  setSessionCookie,
} from "@/modules/auth/session";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  password: z.string().min(1, "Enter your password.").max(200),
});

export type LoginState = { status: "idle" } | { status: "error"; message: string };

/**
 * Admin login.
 *
 * Failures are deliberately indistinguishable (unknown email vs wrong
 * password vs deactivated account) and rate-limited per IP and per account.
 * A dummy bcrypt compare runs when the user is unknown so response timing does
 * not reveal which addresses exist.
 */
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO7ZUr9k4Pkbj4Jhm5eYlZQhO0nqJcPXe";

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });

  const failure: LoginState = {
    status: "error",
    message: "Incorrect email or password.",
  };

  if (!parsed.success) return failure;
  const { email, password } = parsed.data;

  const requestHeaders = await headers();
  const ip = clientIpFromHeaders(requestHeaders);

  // E2E runs sign in dozens of times per suite; production limits stay tight.
  const relaxed = process.env.E2E === "1" ? 100 : 0;
  const ipLimit = rateLimit(`login:ip:${ip}`, { limit: relaxed || 10, windowMs: 15 * 60 * 1000 });
  const accountLimit = rateLimit(`login:acct:${email}`, {
    limit: relaxed || 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!ipLimit.allowed || !accountLimit.allowed) {
    return {
      status: "error",
      message: "Too many sign-in attempts. Please wait a few minutes and try again.",
    };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, isActive: true },
  });

  const passwordOk = await compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.isActive || !passwordOk) return failure;

  const client = `${ip} ${requestHeaders.get("user-agent") ?? ""}`.trim().slice(0, 200);
  const token = await createSession(user.id, client);
  await setSessionCookie(token);

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await recordAudit({
    actorId: user.id,
    action: "auth.login",
    entityType: "User",
    entityId: user.id,
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroyCurrentSession();
  redirect("/admin/login");
}
