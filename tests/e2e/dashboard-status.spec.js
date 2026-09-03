import { test, expect } from "@playwright/test";

// Checks that the dashboard displays the current status on an item card.
test("shows an item's current status in the admin dashboard", async ({ page }) => {
  // Set up an authenticated administrator for the protected dashboard route.
  await page.addInitScript(() => {
    localStorage.setItem("token", "admin-token");
    localStorage.setItem("user", JSON.stringify({ id: "admin-1", fullName: "Admin", role: "Admin" }));
  });

  // Return one pending item when the dashboard loads its item list.
  await page.route("**/api/items", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ count: 1, data: [{
      _id: "dashboard-item-1",
      title: "Approved wallet",
      description: "A wallet awaiting collection.",
      type: "Lost",
      status: "Pending",
      category: "Accessories",
      location: "Universiti Malaya (UM)",
      user: "Test User",
      date: "2026-08-12",
      images: [],
    }] }),
  }));

  await page.route("**/api/messages/conversations*", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ data: [] })
  }));

  await page.goto("/admin-dashboard");

  // The moderation card displays the persisted status badge.
  await expect(page.getByText("Pending", { exact: true }).last()).toBeVisible();
});
