import { expect, test } from "@playwright/test";

const ownerItem = {
  _id: "owner-item-1",
  title: "Owner's lost backpack",
  description: "A backpack reported by its owner.",
  type: "Lost",
  status: "Approved",
  category: "Bag & Backpacks",
  location: "Universiti Malaya (UM)",
  user: "Owner User",
  reportedBy: "owner-1",
  date: "2026-08-16T00:00:00.000Z",
  images: [],
  reportLocation: { type: "Point", coordinates: [101.65, 3.12], formattedAddress: "UM" },
};

const otherItem = {
  ...ownerItem,
  _id: "other-item-1",
  title: "Another user's phone",
  user: "Other User",
  reportedBy: "other-owner",
};

const authenticateRegularUser = async (page) => {
  await page.addInitScript(() => {
    localStorage.setItem("token", "user-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "owner-1", fullName: "Owner User", role: "User" }),
    );
  });
};

const mockCommonRoutes = async (page) => {
  await page.route("**/api/messages/conversations*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }),
  );
};

test("regular user deletes their own post after confirming", async ({ page }) => {
  let deleteRequests = 0;
  await authenticateRegularUser(page);
  await mockCommonRoutes(page);

  await page.route("**/api/items/owner-item-1", async (route) => {
    if (route.request().method() === "DELETE") {
      deleteRequests += 1;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Item deleted successfully." }),
      });
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: ownerItem }),
    });
  });
  await page.route("**/api/items?type=Lost", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ count: 0, data: [] }),
  }));

  await page.goto("/item/owner-item-1");
  await expect(page.getByRole("button", { name: "Delete item" })).toBeVisible();
  await page.getByRole("button", { name: "Delete item" }).click();
  expect(deleteRequests).toBe(0);
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect.poll(() => deleteRequests).toBe(1);
  await expect(page.getByText("Item deleted successfully.")).toBeVisible();
  await expect(page).toHaveURL(/\/lost-items$/);
});

test("regular user cannot delete another user's post", async ({ page }) => {
  let deleteRequests = 0;
  await authenticateRegularUser(page);
  await mockCommonRoutes(page);

  await page.route("**/api/items/other-item-1", async (route) => {
    if (route.request().method() === "DELETE") {
      deleteRequests += 1;
      return route.fulfill({ status: 403, contentType: "application/json", body: "{}" });
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: otherItem }),
    });
  });

  await page.goto("/item/other-item-1");
  await expect(page.getByText("Another user's phone", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete item" })).toHaveCount(0);
  expect(deleteRequests).toBe(0);
});
