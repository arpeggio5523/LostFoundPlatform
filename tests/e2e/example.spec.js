import { test, expect } from '@playwright/test';

test('basic e2e check', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
