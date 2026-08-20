import "server-only";

/**
 * Best-effort client IP for rate-limiting keys.
 *
 * `x-forwarded-for` is spoofable unless the edge strips it, so this is a spam
 * mitigation heuristic and not an identity or security control. Azure Container
 * Apps' ingress sets `x-forwarded-for`; the left-most entry is the client.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
