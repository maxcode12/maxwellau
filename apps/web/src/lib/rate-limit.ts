/**
 * Fixed-window in-memory rate limiter for public form endpoints.
 *
 * Deliberately process-local: CLAUDE.md rules out adding Redis without a
 * measured requirement, and a single Container App replica is the MVP shape.
 * The consequence is that limits are per-replica and reset on deploy, which is
 * acceptable for spam mitigation but is NOT a security control on its own.
 *
 * Phase 14 revisits this once real traffic and replica counts are known.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Bounded so a flood of unique keys cannot grow the map without limit. */
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = {
  readonly allowed: boolean;
  readonly remaining: number;
  /** Seconds until the current window resets. */
  readonly retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  now = Date.now(),
): RateLimitResult {
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) sweep(now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds,
  };
}

function sweep(now: number) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
  // Still full of live windows — drop the oldest to keep memory bounded.
  if (windows.size >= MAX_TRACKED_KEYS) {
    const oldest = [...windows.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (const [key] of oldest.slice(0, Math.floor(MAX_TRACKED_KEYS / 4))) windows.delete(key);
  }
}

/** Test-only helper. */
export function __resetRateLimits() {
  windows.clear();
}
