import { expect, test } from "@playwright/test";

const deletableItem = {
  _id: "item-delete-1",
  title: "Post to delete",
  description: "An item post selected for removal.",
  type: "Lost",
  status: "Rejected",
  category: "Other",
  color: "Black",
  location: "Universiti Malaya (UM)",
  user: "Test User",
  reportedBy: "user-1",
  date: "2026-08-14T00:00:00.000Z",
  createdAt: "2026-08-14T00:00:00.000Z",
  images: [],
  reportLocation: {
    type: "Point",
    coordinates: [101.65, 3.12],
    formattedAddress: "Universiti Malaya (UM)",
  },
};

test("admin deletes a post from its details page", async ({ page }) => {
  let deleted = false;
  let deleteRequests = 0;

  await page.addInitScript(() => {
    localStorage.setItem("token", "admin-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "admin-1", fullName: "Admin", role: "Admin" }),
    );
  });

  await page.route("**/api/items", async (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    const data = deleted ? [] : [deletableItem];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ count: data.length, data }),
    });
  });

  await page.route("**/api/items/item-delete-1", async (route) => {
    if (route.request().method() === "DELETE") {
      deleteRequests += 1;
      deleted = true;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Item deleted successfully." }),
      });
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: deletableItem }),
    });
  });

  await page.route("**/api/messages/conversations*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }),
  );

  await page.goto("/admin-dashboard");
  await page.getByRole("button", { name: "Rejected (1)" }).click();
  await page.getByRole("link", { name: "View details for Post to delete" }).click();

  await expect(page).toHaveURL(/\/item\/item-delete-1\?returnTo=%2Fadmin-dashboard/);
  await expect(page.getByRole("button", { name: "Delete item" })).toBeVisible();
  await page.getByRole("button", { name: "Delete item" }).click();

  await expect(page.getByRole("heading", { name: "Delete Item" })).toBeVisible();
  expect(deleteRequests).toBe(0);

  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect.poll(() => deleteRequests).toBe(1);
  await expect(page.getByText("Item deleted successfully.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin-dashboard$/);
  await expect(page.getByText("All Items (0)")).toBeVisible();
  await expect(page.getByText("Post to delete", { exact: true })).toHaveCount(0);
});
