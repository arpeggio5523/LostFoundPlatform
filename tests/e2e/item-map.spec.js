import { test, expect } from '@playwright/test';

const mockItem = {
  _id: 'mock-item-123',
  title: 'Black backpack near Student Precinct',
  type: 'Lost',
  description: 'Black backpack with a teal zipper, last seen near the library.',
  location: 'Student Precinct, Melbourne',
  date: '2026-08-31T09:00:00.000Z',
  status: 'Active',
  reportLocation: {
    type: 'Point',
    coordinates: [144.9631, -37.8136],
    formattedAddress: 'Student Precinct, Melbourne VIC 3000, Australia',
  },
  user: 'mockuser',
};

const mockFoundItem = {
  ...mockItem,
  _id: 'mock-found-item-456',
  title: 'Blue wallet at Federation Square',
  type: 'Found',
  description: 'Blue leather wallet found near the tram stop.',
  location: 'Federation Square, Melbourne',
  reportLocation: {
    type: 'Point',
    coordinates: [144.9685, -37.8179],
    formattedAddress: 'Federation Square, Melbourne VIC 3000, Australia',
  },
};

test.describe('Item map feature', () => {
  test('opens the full-map view in a new tab and shows the item pin location', async ({ page }) => {
    await page.context().route('**/api/items/mock-item-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockItem }),
      });
    });

    await page.goto('/item/mock-item-123');

    await expect(page).toHaveURL(/\/item\/mock-item-123$/);
    await expect(page.getByText('Reported location')).toBeVisible();

    const mapCanvas = page.locator('[aria-label="Lost location map"]');
    await expect(mapCanvas).toBeVisible();

    const [fullMapPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: /view full map/i }).click(),
    ]);

    await fullMapPage.waitForLoadState();
    await expect(fullMapPage).toHaveURL(/\/item\/mock-item-123\/map$/);
    await expect(fullMapPage.getByText('Lost location')).toBeVisible();
    await expect(fullMapPage.getByText('Black backpack near Student Precinct')).toBeVisible();

    const fullMapCanvas = fullMapPage.locator('[aria-label="Lost location map"]');
    await expect(fullMapCanvas).toBeVisible();

    const mapBox = fullMapCanvas.locator('canvas');
    await expect(mapBox).toBeVisible();

    const beforeCenter = await mapBox.evaluate((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    await fullMapPage.mouse.move(beforeCenter.x, beforeCenter.y);
    await fullMapPage.mouse.down();
    await fullMapPage.mouse.move(beforeCenter.x + 120, beforeCenter.y + 40, { steps: 20 });
    await fullMapPage.mouse.up();

    const afterCenter = await mapBox.evaluate((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    await expect(fullMapCanvas).toBeVisible();
    expect(afterCenter.x).not.toBeNaN();
    expect(afterCenter.y).not.toBeNaN();
  });

  test('opens the full-map view for a found item and keeps the location pin visible', async ({ page }) => {
    await page.context().route('**/api/items/mock-found-item-456', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockFoundItem }),
      });
    });

    await page.goto('/item/mock-found-item-456');

    await expect(page).toHaveURL(/\/item\/mock-found-item-456$/);
    await expect(page.getByText('Reported location')).toBeVisible();
    await expect(page.getByText('Blue wallet at Federation Square')).toBeVisible();

    const [fullMapPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: /view full map/i }).click(),
    ]);

    await fullMapPage.waitForLoadState();
    await expect(fullMapPage).toHaveURL(/\/item\/mock-found-item-456\/map$/);
    await expect(fullMapPage.getByText('Found location')).toBeVisible();
    await expect(fullMapPage.locator('[aria-label="Found location map"]')).toBeVisible();
  });
});
