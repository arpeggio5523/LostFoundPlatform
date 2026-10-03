import { expect, test } from "@playwright/test";

const pendingItem = {
  _id: "item-reject-1",
  title: "Unclear item post",
  description: "A post awaiting moderation.",
  type: "Found",
  status: "Pending",
  category: "Other",
  location: "Universiti Malaya (UM)",
  user: "Test User",
  createdAt: "2026-08-13T00:00:00.000Z",
  images: [],
};

test("admin rejects a pending post from the moderation dashboard", async ({ page }) => {
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

  await page.route("**/api/items/item-reject-1/status", async (route) => {
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

  await page.getByRole("button", { name: "Reject", exact: true }).click();

  await expect.poll(() => submittedStatus).toBe("Rejected");
  await expect(page.getByText("Post rejected successfully.")).toBeVisible();
  await expect(page.getByText("Pending (0)")).toBeVisible();
  await expect(page.getByText("Rejected (1)")).toBeVisible();
  await expect(page.getByText("There is no pending post.")).toBeVisible();

  await page.getByRole("button", { name: "Rejected (1)" }).click();
  await expect(page.getByText("Unclear item post", { exact: true })).toBeVisible();
  await expect(page.getByText("Rejected", { exact: true })).toBeVisible();
});
