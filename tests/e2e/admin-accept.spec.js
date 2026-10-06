import { expect, test } from "@playwright/test";

const pendingItem = {
  _id: "item-accept-1",
  title: "Black wallet",
  description: "A black wallet awaiting moderation.",
  type: "Lost",
  status: "Pending",
  category: "Accessories",
  location: "Universiti Malaya (UM)",
  user: "Test User",
  createdAt: "2026-08-12T00:00:00.000Z",
  images: [],
};

test("admin accepts a pending post from the moderation dashboard", async ({ page }) => {
  let status = "Pending";
  let submittedStatus;

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
      body: JSON.stringify({ count: 1, data: [{ ...pendingItem, status }] }),
    });
  });

  await page.route("**/api/items/item-accept-1/status", async (route) => {
    submittedStatus = route.request().postDataJSON().status;
    status = submittedStatus;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Item status updated",
        data: { ...pendingItem, status },
      }),
    });
  });

  await page.route("**/api/messages/conversations*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }),
  );

  await page.goto("/admin-dashboard");
  await expect(page.getByText("Pending (1)")).toBeVisible();

  await page.getByRole("button", { name: "Approve", exact: true }).click();

  await expect.poll(() => submittedStatus).toBe("Approved");
  await expect(page.getByText("Post approved successfully.")).toBeVisible();
  await expect(page.getByText("Pending (0)")).toBeVisible();
  await expect(page.getByText("Approved (1)")).toBeVisible();
  await expect(page.getByText("There is no pending post.")).toBeVisible();

  await page.getByRole("button", { name: "Approved (1)" }).click();
  await expect(page.getByText("Black wallet", { exact: true })).toBeVisible();
  await expect(page.getByText("Approved", { exact: true })).toBeVisible();
});
