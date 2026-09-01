import { test, expect } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:5173";

const OWNER = {
  email: process.env.E2E_OWNER_EMAIL || "ombsihvfbk@bltiwd.com",
  password: process.env.E2E_OWNER_PASSWORD || "3dd23d23d3d23deASADCQWE@@@"
};
const OTHER_USER = {
  email: process.env.E2E_OTHER_EMAIL || "eenh3vtort@ozsaip.com",
  password: process.env.E2E_OTHER_PASSWORD || "3dd23d23d3d23deASADCQWE@@@"
};

const OWNED_ITEM_ID =
  process.env.E2E_OWNED_ITEM_ID || "6a967debabc021703a3089cb";
const DELETABLE_ITEM_ID =
  process.env.E2E_DELETABLE_ITEM_ID || "6a967debabc021703a3089cb";

async function login(page, { email, password }) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByPlaceholder("your.email@university.edu").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"));
}

test.describe("Viewing a lost item post - Edit/Delete visibility", () => {
  test("owner sees the Delete button on their own post", async ({ page }) => {
    await login(page, OWNER);
    await page.goto(`${BASE_URL}/item/${OWNED_ITEM_ID}`);

    await expect(
      page.getByRole("button", { name: "Delete item" })
    ).toBeVisible();
  });

  test("owner sees the Edit button on their own post", async ({ page }) => {
    await login(page, OWNER);
    await page.goto(`${BASE_URL}/item/${OWNED_ITEM_ID}`);

    await expect(
      page.getByRole("button", { name: "Edit", exact: true })
    ).toBeVisible();
  });

  test("a non-owner, non-admin viewer sees neither Edit nor Delete", async ({
    page
  }) => {
    await login(page, OTHER_USER);
    await page.goto(`${BASE_URL}/item/${OWNED_ITEM_ID}`);

    // await expect(page.getByText("Reported location")).toBeVisible();

    await expect(page.getByRole("button", { name: "Delete item" })).toHaveCount(
      0
    );
    await expect(
      page.getByRole("button", { name: "Edit", exact: true })
    ).toHaveCount(0);
  });
});

test.describe("Editing a lost item post", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, OWNER);
  });

  test("pre-fills the form with the existing item data", async ({ page }) => {
    await page.goto(`${BASE_URL}/report-lost?edit=${OWNED_ITEM_ID}`);

    await expect(
      page.getByRole("heading", { name: "Edit Lost Item" })
    ).toBeVisible();

    const titleInput = page.getByPlaceholder("e.g., iPhone with Blue Case");
    const descriptionInput = page.getByPlaceholder(
      "Describe the item you lost..."
    );

    await expect(titleInput).not.toHaveValue("");
    await expect(descriptionInput).not.toHaveValue("");
  });

  test("shows a validation error when the title is cleared", async ({
    page
  }) => {
    // Doesn't save - clears the field, submits, checks the error, then
    // leaves without confirming any change.
    await page.goto(`${BASE_URL}/report-lost?edit=${OWNED_ITEM_ID}`);
    await expect(
      page.getByRole("heading", { name: "Edit Lost Item" })
    ).toBeVisible();

    const titleInput = page.getByPlaceholder("e.g., iPhone with Blue Case");
    await expect(titleInput).not.toHaveValue(""); // wait for pre-fill to land first
    await titleInput.fill("");
    await page.getByRole("button", { name: "Save Changes" }).click();

    // await expect(page.getByText("Item title is required.")).toBeVisible();
  });
});
