import { describe, expect, it } from "vitest";
import { cn, formatDate, formatDuration, formatTime, slugify } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting Tailwind classes, last one winning", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});

describe("slugify", () => {
  it("lower-cases and hyphenates", () => {
    expect(slugify("King's Time — November Session")).toBe("king-s-time-november-session");
  });

  it("strips diacritics", () => {
    expect(slugify("Àdéọlá Session")).toBe("adeola-session");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  ***Worship***  ")).toBe("worship");
  });
});

describe("date formatting", () => {
  it("formats a UTC timestamp without shifting the day", () => {
    expect(formatDate("2026-11-14T23:30:00.000Z")).toBe("14 November 2026");
  });

  it("formats the time in UTC on a 24-hour clock", () => {
    expect(formatTime("2026-11-14T18:30:00.000Z")).toBe("18:30");
  });
});

describe("formatDuration", () => {
  it("pads the seconds", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  it("handles durations over an hour as total minutes", () => {
    expect(formatDuration(3_661)).toBe("61:01");
  });

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0:00");
  });
});
