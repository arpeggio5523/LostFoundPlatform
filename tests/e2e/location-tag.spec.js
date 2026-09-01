import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Provide the authenticated user needed to open the report form.
  await page.addInitScript(() => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify({ id: "user-1", fullName: "Test User" }));
  });
});

// Checks that the report form opens the location-tagging interface.
test("opens the location tag map interface", async ({ page }) => {
  await page.goto("/report-lost");
  await page.getByRole("button", { name: /tag location on map/i }).click();
  await expect(page.getByRole("heading", { name: "Tag Location" })).toBeVisible();
  await expect(page.getByText(/click the map to drop a pin/i)).toBeVisible();
});
