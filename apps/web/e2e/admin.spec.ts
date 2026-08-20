import { expect, test, type Page } from "@playwright/test";

/**
 * Admin flows run against the seeded local database
 * (`npm run db:seed` creates admin@localhost.dev / local-dev-password).
 */
const ADMIN_EMAIL = "admin@localhost.dev";
const ADMIN_PASSWORD = "local-dev-password";

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe("admin authentication", () => {
  test("unauthenticated users are redirected to the login page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: /admin/i })).toBeVisible();
  });

  test("wrong credentials show a generic error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Incorrect email or password.")).toBeVisible();
  });

  test("valid credentials reach the dashboard and sign-out returns to login", async ({
    page,
    isMobile,
  }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();

    // On mobile the user footer lives inside the collapsed drawer.
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Sign out" }).first().click();
    await expect(page).toHaveURL(/\/admin\/login$/);

    // The session is gone server-side, not just the cookie client-side.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test.describe("admin content management", () => {
  test.describe.configure({ mode: "serial" });

  test("an admin can create and edit an event", async ({ page }) => {
    await signIn(page);

    const marker = `E2E Event ${Date.now().toString(36)}`;

    await page.goto("/admin/events/new");
    await page.getByLabel("Title").fill(marker);
    await page.getByLabel("Starts (UTC)").fill("2027-06-12T18:30");
    await page.getByLabel("Description").fill("Created by the admin E2E test.");
    await page.getByLabel("City").fill("Windsor");
    await page.getByRole("button", { name: "Save event" }).click();

    await expect(page.getByRole("status")).toContainText("Event saved");

    await page.goto("/admin/events");
    const row = page.getByRole("link", { name: marker });
    await expect(row).toBeVisible();

    await row.click();
    await page.getByLabel("Visibility").selectOption("PUBLISHED");
    await page.getByRole("button", { name: "Save event" }).click();
    await expect(page.getByRole("status")).toContainText("Event saved");
  });

  test("a booking can be moved through the workflow", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/bookings");

    const first = page.locator("tbody tr td a").first();
    // Requires at least one booking (the booking E2E creates them).
    if ((await first.count()) === 0) test.skip(true, "No bookings in the database");

    await first.click();
    await expect(page).toHaveURL(/\/admin\/bookings\/[0-9a-f-]{36}$/);
    await page.getByLabel("Status").selectOption("REVIEWING");
    await page.getByLabel("Internal notes").fill("Reviewed by the admin E2E test.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Booking updated");
  });
});
