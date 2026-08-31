import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.context().addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'admin123',
        role: 'Admin',
        email: 'admin@test.com',
      }));
    });
  });

  test('should load analytics dashboard and display data', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/analytics', (route) => {
      route.abort('blockedbyclient');
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            totalPosts: 25,
            lostPosts: 10,
            foundPosts: 15,
            statuses: {
              pending: 8,
              approved: 12,
              rejected: 3,
              deleted: 2,
            },
            generatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto('http://localhost:3000/analytics');

    // Wait for page to load
    await page.waitForSelector('h1:has-text("Analytics dashboard")');

    // Verify title
    await expect(page.locator('h1')).toContainText('Analytics dashboard');

    // Verify metric cards are rendered
    await expect(page.locator('text=Total posts')).toBeVisible();
    await expect(page.locator('text=Lost posts')).toBeVisible();
    await expect(page.locator('text=Found posts')).toBeVisible();

    // Verify values (adjust selectors based on actual DOM)
    await expect(page.locator('text=25')).toBeVisible(); // totalPosts
  });

  test('should refresh analytics on button click', async ({ page }) => {
    let callCount = 0;

    await page.route('**/api/analytics', (route) => {
      callCount++;
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            totalPosts: callCount * 10,
            lostPosts: callCount * 5,
            foundPosts: callCount * 5,
            statuses: {
              pending: 2,
              approved: 3,
              rejected: 1,
              deleted: 0,
            },
            generatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto('http://localhost:3000/analytics');
    await page.waitForSelector('h1:has-text("Analytics dashboard")');

    // Click refresh button
    await page.locator('button[title="Refresh analytics"]').click();

    // Verify API was called again
    await page.waitForTimeout(500);
    expect(callCount).toBeGreaterThan(1);
  });

  test('should redirect non-admin users to dashboard', async ({ page }) => {
    // Update auth to be non-admin
    await page.context().addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'user123',
        role: 'User',
        email: 'user@test.com',
      }));
    });

    await page.goto('http://localhost:3000/analytics');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Clear auth
    await page.context().addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('http://localhost:3000/analytics');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display error message on API failure', async ({ page }) => {
    await page.route('**/api/analytics', (route) => {
      route.abort('failed');
    });

    await page.goto('http://localhost:3000/analytics');

    // Verify error message appears
    await expect(page.locator('text=/Unable to load analytics/i')).toBeVisible();
  });

  test('should logout on logout button click', async ({ page }) => {
    await page.route('**/api/analytics', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            totalPosts: 25,
            lostPosts: 10,
            foundPosts: 15,
            statuses: {
              pending: 8,
              approved: 12,
              rejected: 3,
              deleted: 2,
            },
            generatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto('http://localhost:3000/analytics');
    await page.waitForSelector('h1:has-text("Analytics dashboard")');

    // Click logout button
    await page.locator('button:has-text("Logout")').click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});