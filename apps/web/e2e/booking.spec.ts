import { expect, test, type Page } from "@playwright/test";

function futureDate(daysAhead = 60): string {
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

/**
 * Labels are matched non-exactly because required fields render a visible
 * asterisk inside the label. Scoped to <main> so the footer newsletter form's
 * email field can never collide.
 */
function form(page: Page) {
  return page.getByRole("main");
}

test.describe("booking submission", () => {
  test("a complete request is accepted and returns a reference", async ({ page }) => {
    await page.goto("/booking");
    const main = form(page);

    await main.getByLabel("Your name").fill("Grace Adeyemi");
    await main.getByLabel("Church or organisation").fill("Sample Church");
    await main.getByLabel("Email").fill("grace@example.com");
    await main.getByLabel("Event type").selectOption("WORSHIP_NIGHT");
    await main.getByLabel("Event date").fill(futureDate());
    await main.getByLabel("Location").fill("London, United Kingdom");
    await main
      .getByLabel("Tell us about the event")
      .fill("We would love to host a night of worship with your team this autumn.");

    await main.getByRole("button", { name: "Send request" }).click();

    await expect(main.getByRole("heading", { name: "Request received" })).toBeVisible();
    await expect(main.getByText(/^MAU-/)).toBeVisible();
  });

  test("a past event date is rejected with an accessible error", async ({ page }) => {
    await page.goto("/booking");
    const main = form(page);

    await main.getByLabel("Your name").fill("Grace Adeyemi");
    await main.getByLabel("Email").fill("grace@example.com");
    await main.getByLabel("Event type").selectOption("CONFERENCE");
    await main.getByLabel("Event date").fill("2020-01-01");
    await main.getByLabel("Location").fill("Manchester");
    await main.getByLabel("Tell us about the event").fill("A conference we are planning.");

    await main.getByRole("button", { name: "Send request" }).click();

    await expect(main.getByRole("alert").first()).toBeVisible();
    await expect(main.getByLabel("Event date")).toHaveAttribute("aria-invalid", "true");
  });
});
