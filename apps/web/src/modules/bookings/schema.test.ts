import { describe, expect, it } from "vitest";
import { bookingRequestSchema } from "@/modules/bookings/schema";

function futureDate(daysAhead = 30): string {
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

const valid = {
  contactName: "  Grace Adeyemi ",
  organisation: "Sample Church",
  email: "Grace@Example.COM",
  phone: "+44 20 7946 0000",
  eventType: "WORSHIP_NIGHT",
  eventDate: futureDate(),
  location: "London, United Kingdom",
  message: "We would love to host a night of worship with your team this autumn.",
  website: "",
};

describe("bookingRequestSchema", () => {
  it("accepts a well-formed request", () => {
    const result = bookingRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("trims names and normalises the email to lower case", () => {
    const result = bookingRequestSchema.parse(valid);
    expect(result.contactName).toBe("Grace Adeyemi");
    expect(result.email).toBe("grace@example.com");
  });

  it("rejects an invalid email", () => {
    const result = bookingRequestSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a date in the past", () => {
    const result = bookingRequestSchema.safeParse({ ...valid, eventDate: "2020-01-01" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "eventDate")).toBe(true);
    }
  });

  it("rejects an unknown event type", () => {
    const result = bookingRequestSchema.safeParse({ ...valid, eventType: "PARTY" });
    expect(result.success).toBe(false);
  });

  it("rejects a message that is too short to act on", () => {
    const result = bookingRequestSchema.safeParse({ ...valid, message: "hi" });
    expect(result.success).toBe(false);
  });

  it("treats organisation and phone as optional", () => {
    const result = bookingRequestSchema.safeParse({ ...valid, organisation: "", phone: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a phone number containing letters", () => {
    const result = bookingRequestSchema.safeParse({ ...valid, phone: "call me" });
    expect(result.success).toBe(false);
  });

  it("parses a filled honeypot without erroring so the action can drop it silently", () => {
    const result = bookingRequestSchema.safeParse({ ...valid, website: "http://spam.example" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.website).toBe("http://spam.example");
  });
});
