import { expect, test } from "@playwright/test";

const originalItem = {
  _id: "item-edit-1",
  title: "Original admin post",
  description: "Original description for the item.",
  type: "Lost",
  status: "Pending",
  category: "Accessories",
  color: "Blue",
  distMark: "Small scratch",
  location: "Universiti Malaya (UM)",
  exactLocation: "Main library",
  user: "Test User",
  reportedBy: "user-1",
  date: "2026-08-15T00:00:00.000Z",
  createdAt: "2026-08-15T00:00:00.000Z",
  images: [],
  reportLocation: {
    type: "Point",
    coordinates: [101.6544, 3.1201],
    formattedAddress: "UM Library",
  },
};

test("admin edits a post from the moderation dashboard", async ({ page }) => {
  let currentItem = { ...originalItem };
  let submittedEdit;

  await page.addInitScript(() => {
    localStorage.setItem("token", "admin-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "admin-1", fullName: "Admin", role: "Admin" }),
    );
  });

  await page.route("**/api/items", async (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ count: 1, data: [currentItem] }),
    });
  });

  await page.route("**/api/items/item-edit-1", async (route) => {
    if (route.request().method() === "PUT") {
      submittedEdit = route.request().postDataJSON();
      currentItem = { ...currentItem, ...submittedEdit };
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Item updated.", data: currentItem }),
      });
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: currentItem }),
    });
  });

  await page.route("**/api/messages/conversations*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }),
  );

  await page.goto("/admin-dashboard");
  await page.getByRole("link", { name: "View details for Original admin post" }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Edit Lost Item" })).toBeVisible();
  const title = page.getByPlaceholder("e.g., iPhone with Blue Case");
  await expect(title).toHaveValue("Original admin post");
  await expect(page.locator('select[name="status"]')).toHaveValue("Pending");

  await title.fill("Edited by administrator");
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect.poll(() => submittedEdit?.title).toBe("Edited by administrator");
  expect(submittedEdit.status).toBe("Pending");
  await expect(page.getByText("Item updated successfully!")).toBeVisible();
  await expect(page).toHaveURL(/\/item\/item-edit-1\?returnTo=%2Fadmin-dashboard/);
  await expect(page.getByRole("heading", { name: "Edited by administrator" })).toBeVisible();
  await page.getByRole("button", { name: "Back to Admin Dashboard" }).click();
  await expect(page.getByText("Edited by administrator", { exact: true })).toBeVisible();
});
