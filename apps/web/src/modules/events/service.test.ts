import { describe, expect, it } from "vitest";
import { listPastEvents, listUpcomingEvents } from "@/modules/events/service";

/** Between the two sample events either side of it. */
const NOW = Date.parse("2026-08-20T00:00:00.000Z");

describe("events service", () => {
  it("splits events into upcoming and past around the supplied instant", async () => {
    const [upcoming, past] = await Promise.all([
      listUpcomingEvents(undefined, NOW),
      listPastEvents(undefined, NOW),
    ]);

    expect(upcoming.length).toBeGreaterThan(0);
    expect(past.length).toBeGreaterThan(0);

    const upcomingSlugs = new Set(upcoming.map((event) => event.slug));
    for (const event of past) {
      expect(upcomingSlugs.has(event.slug)).toBe(false);
    }
  });

  it("orders upcoming events soonest first", async () => {
    const upcoming = await listUpcomingEvents(undefined, NOW);
    const times = upcoming.map((event) => Date.parse(event.startsAt));
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it("orders past events most recent first", async () => {
    const past = await listPastEvents(undefined, NOW);
    const times = past.map((event) => Date.parse(event.startsAt));
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it("keeps a multi-day event upcoming until its end date passes", async () => {
    // The sample conference runs 5–7 March 2027.
    const midConference = Date.parse("2027-03-06T12:00:00.000Z");
    const upcoming = await listUpcomingEvents(undefined, midConference);
    expect(upcoming.some((event) => event.slug === "sample-worship-conference")).toBe(true);
  });

  it("honours the limit", async () => {
    const upcoming = await listUpcomingEvents(1, NOW);
    expect(upcoming).toHaveLength(1);
  });
});
