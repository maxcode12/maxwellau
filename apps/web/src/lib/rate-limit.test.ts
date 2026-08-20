import { beforeEach, describe, expect, it } from "vitest";
import { __resetRateLimits, rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimits();
  });

  it("allows requests up to the limit", () => {
    const options = { limit: 3, windowMs: 60_000 };
    expect(rateLimit("a", options, 0).allowed).toBe(true);
    expect(rateLimit("a", options, 1).allowed).toBe(true);
    expect(rateLimit("a", options, 2).allowed).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const options = { limit: 2, windowMs: 60_000 };
    rateLimit("b", options, 0);
    rateLimit("b", options, 1);
    expect(rateLimit("b", options, 2).allowed).toBe(false);
  });

  it("tracks keys independently", () => {
    const options = { limit: 1, windowMs: 60_000 };
    expect(rateLimit("c", options, 0).allowed).toBe(true);
    expect(rateLimit("d", options, 0).allowed).toBe(true);
    expect(rateLimit("c", options, 0).allowed).toBe(false);
  });

  it("resets once the window has elapsed", () => {
    const options = { limit: 1, windowMs: 1_000 };
    expect(rateLimit("e", options, 0).allowed).toBe(true);
    expect(rateLimit("e", options, 500).allowed).toBe(false);
    expect(rateLimit("e", options, 1_001).allowed).toBe(true);
  });

  it("reports the seconds remaining in the window", () => {
    const options = { limit: 1, windowMs: 60_000 };
    rateLimit("f", options, 0);
    expect(rateLimit("f", options, 10_000).retryAfterSeconds).toBe(50);
  });
});
