import { test, expect } from "@playwright/test";

const item = {
  _id: "status-item-1",
  title: "Lost black wallet",
  description: "A black wallet with a student card inside.",
  category: "Accessories",
  location: "Universiti Malaya (UM)",
  date: "2026-08-12",
  user: "Test User",
  type: "Lost",
  status: "Lost",
  images: [],
  reportedBy: "user-1",
  reportLocation: { type: "Point", coordinates: [101.65, 3.12], formattedAddress: "UM" },
};

test.beforeEach(async ({ page }) => {
  // Provide a logged-in user and mock the item API responses used by the pages.
  await page.addInitScript(() => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify({ id: "user-1", fullName: "Test User" }));
  });
  await page.route("**/api/items?type=Lost", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [item], count: 1 }) }));
  await page.route("**/api/items/status-item-1", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: item }) }));
  await page.route("**/api/messages/conversations*", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
});

// Checks that the status is visible in the list and on the item's details page.
test("shows Lost status in the list and on item details", async ({ page }) => {
  await page.goto("/lost-items");
  await expect(page.getByText("Lost", { exact: true }).first()).toBeVisible();
  await page.getByText(item.title).click();
  await expect(page).toHaveURL(/\/item\/status-item-1/);
  await expect(page.getByText("Lost", { exact: true }).first()).toBeVisible();
});

// Checks that the saved status is still visible after the details page is refreshed.
test("retains the Found status after revisiting the details page", async ({ page }) => {
  const found = { ...item, type: "Found", status: "Found", title: "Found phone" };
  await page.unroute("**/api/items/status-item-1");
  await page.route("**/api/items/status-item-1", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: found }) }));
  await page.goto("/item/status-item-1");
  await expect(page.getByText("Found", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("Found", { exact: true }).first()).toBeVisible();
});
