import { withSamples } from "@/content/content-mode";
import { sampleKingsTimeSessions } from "@/content/sample/kings-time";
import type { KingsTimeSession } from "@/modules/kings-time/types";

function allSessions(): readonly KingsTimeSession[] {
  return withSamples(sampleKingsTimeSessions);
}

function sessionEnd(session: KingsTimeSession): number {
  return Date.parse(session.endsAt ?? session.startsAt);
}

export type SessionView = { readonly session: KingsTimeSession; readonly isUpcoming: boolean };

/**
 * The session to feature on the home page: the next one, else the most recent.
 *
 * The clock is read here rather than in a component so rendering stays pure.
 */
export async function getCurrentSession(now = Date.now()): Promise<SessionView | null> {
  const upcoming = [...allSessions()]
    .filter((session) => sessionEnd(session) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  if (upcoming[0]) return { session: upcoming[0], isUpcoming: true };

  const past = [...allSessions()].sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
  return past[0] ? { session: past[0], isUpcoming: false } : null;
}

export async function listSessions(now = Date.now()): Promise<{
  upcoming: KingsTimeSession[];
  archive: KingsTimeSession[];
}> {
  const sessions = [...allSessions()];
  return {
    upcoming: sessions
      .filter((session) => sessionEnd(session) >= now)
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    archive: sessions
      .filter((session) => sessionEnd(session) < now)
      .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt)),
  };
}

export async function getSessionBySlug(slug: string): Promise<KingsTimeSession | null> {
  return allSessions().find((session) => session.slug === slug) ?? null;
}

export type SessionDetail = { readonly session: KingsTimeSession; readonly isPast: boolean };

export async function getSessionDetail(
  slug: string,
  now = Date.now(),
): Promise<SessionDetail | null> {
  const session = await getSessionBySlug(slug);
  return session ? { session, isPast: sessionEnd(session) < now } : null;
}
