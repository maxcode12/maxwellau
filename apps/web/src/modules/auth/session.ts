import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Role, User } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Session management.
 *
 * - The cookie holds an opaque 256-bit random token; only its SHA-256 hash is
 *   stored, so a database leak cannot be replayed as a session.
 * - Cookies are httpOnly + SameSite=Lax + Secure (in production).
 * - Sessions have a sliding 14-day expiry, refreshed when less than half the
 *   lifetime remains.
 */

export const SESSION_COOKIE = "mau_session";
const SESSION_LIFETIME_MS = 14 * 24 * 60 * 60 * 1000;

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, client?: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");

  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
      client: client?.slice(0, 200) ?? null,
    },
  });

  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure everywhere except local dev and local E2E: WebKit (unlike
    // Chromium) refuses Secure cookies on plain-HTTP 127.0.0.1.
    secure: process.env.NODE_ENV === "production" && process.env.E2E !== "1",
    path: "/",
    maxAge: SESSION_LIFETIME_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Resolve the current user from the session cookie, or null.
 * `cache()` deduplicates the lookup within one request render.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, isActive: true } } },
  });

  if (!session || session.expiresAt.getTime() < Date.now() || !session.user.isActive) {
    return null;
  }

  // Sliding expiry: extend when under half the lifetime remains. Fire-and-forget.
  if (session.expiresAt.getTime() - Date.now() < SESSION_LIFETIME_MS / 2) {
    db.session
      .update({
        where: { id: session.id },
        data: { expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS) },
      })
      .catch(() => undefined);
  }

  const { id, email, name, role } = session.user;
  return { id, email, name, role };
});

export async function destroyCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

/** Delete every session for a user (password change, deactivation). */
export async function destroyAllSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}

/** Constant-time string comparison for token-like values. */
export function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function hasRole(user: SessionUser, ...roles: Role[]): boolean {
  return roles.includes(user.role);
}
