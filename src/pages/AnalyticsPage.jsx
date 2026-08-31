import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard Page', () => {

  test.setTimeout(60000);

  // ---------------------------------------------------------
  // ADMIN TESTS
  // ---------------------------------------------------------

  test('should load analytics dashboard and display data', async ({ page }) => {

    // Mock the analytics API
    await page.route('**/api/analytics', async (route) => {
      await route.fulfill({
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

    // Set admin authentication BEFORE the page loads
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'admin123',
          role: 'Admin',
          email: 'admin@test.com',
        })
      );
    });

    await page.goto('http://localhost:3000/analytics', {
      waitUntil: 'domcontentloaded',
    });

    // Make sure we actually reached Analytics
    await expect(page).toHaveURL(/\/analytics/);

    // Wait for the actual page content
    await expect(
      page.getByText('Posts statistics')
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText('Moderation status')
    ).toBeVisible();

    // Verify status information
    await expect(
      page.getByText('Pending')
    ).toBeVisible();

    await expect(
      page.getByText('Approved')
    ).toBeVisible();

    await expect(
      page.getByText('Rejected')
    ).toBeVisible();

    await expect(
      page.getByText('Deleted')
    ).toBeVisible();
  });


  // ---------------------------------------------------------
  // REFRESH TEST
  // ---------------------------------------------------------

  test('should refresh analytics on button click', async ({ page }) => {

    let callCount = 0;

    // Mock API
    await page.route('**/api/analytics', async (route) => {
      callCount++;

      await route.fulfill({
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

    // Admin authentication
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'admin123',
          role: 'Admin',
          email: 'admin@test.com',
        })
      );
    });

    await page.goto('http://localhost:3000/analytics', {
      waitUntil: 'domcontentloaded',
    });

    await expect(page).toHaveURL(/\/analytics/);

    // Wait until the Analytics page has loaded
    await expect(
      page.getByText('Posts statistics')
    ).toBeVisible({ timeout: 10000 });

    // Find refresh button
    const refreshButton = page.locator(
      'button[title="Refresh analytics"]'
    );

    await expect(refreshButton).toBeVisible();

    // Initial API call should have happened
    expect(callCount).toBeGreaterThanOrEqual(1);

    const callsBeforeRefresh = callCount;

    // Click refresh
    await refreshButton.click();

    // Wait until another API request happens
    await expect
      .poll(() => callCount, {
        timeout: 10000,
      })
      .toBeGreaterThan(callsBeforeRefresh);

    expect(callCount).toBeGreaterThanOrEqual(2);
  });


  // ---------------------------------------------------------
  // NON-ADMIN TEST
  // ---------------------------------------------------------

  test('should redirect non-admin users to dashboard', async ({ page }) => {

    // Set regular User authentication
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'user123',
          role: 'User',
          email: 'user@test.com',
        })
      );
    });

    // API should not matter because user should be redirected
    await page.route('**/api/analytics', async (route) => {
      await route.abort();
    });

    await page.goto('http://localhost:3000/analytics', {
      waitUntil: 'domcontentloaded',
    });

    // AnalyticsPage redirects non-admins to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, {
      timeout: 10000,
    });
  });


  // ---------------------------------------------------------
  // UNAUTHENTICATED USER TEST
  // ---------------------------------------------------------

  test('should redirect unauthenticated users to login', async ({ page }) => {

    // IMPORTANT:
    // Do NOT set authToken or user here.

    await page.route('**/api/analytics', async (route) => {
      await route.abort();
    });

    await page.goto('http://localhost:3000/analytics', {
      waitUntil: 'domcontentloaded',
    });

    // AnalyticsPage redirects unauthenticated users to /login
    await expect(page).toHaveURL(/\/login/, {
      timeout: 10000,
    });
  });


  // ---------------------------------------------------------
  // API FAILURE TEST
  // ---------------------------------------------------------

  test('should display error message on API failure', async ({ page }) => {

    // Admin authentication
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'admin123',
          role: 'Admin',
          email: 'admin@test.com',
        })
      );
    });

    // Make API fail
    await page.route('**/api/analytics', async (route) => {
      await route.abort('failed');
    });

    await page.goto('http://localhost:3000/analytics', {
      waitUntil: 'domcontentloaded',
    });

    // The page should still load, but show the error
    await expect(
      page.getByText(/Unable to load analytics/i)
    ).toBeVisible({
      timeout: 10000,
    });
  });


  // ---------------------------------------------------------
  // LOGOUT TEST
  // ---------------------------------------------------------

  test('should logout on logout button click', async ({ page }) => {

    // Mock API
    await page.route('**/api/analytics', async (route) => {
      await route.fulfill({
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

    // Admin authentication
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'admin123',
          role: 'Admin',
          email: 'admin@test.com',
        })
      );
    });

    await page.goto('http://localhost:3000/analytics', {
      waitUntil: 'domcontentloaded',
    });

    // Make sure Analytics loaded
    await expect(
      page.getByText('Posts statistics')
    ).toBeVisible({
      timeout: 10000,
    });

    // Find Logout button
    const logoutButton = page.getByRole('button', {
      name: 'Logout',
    });

    await expect(logoutButton).toBeVisible();

    // Click Logout
    await logoutButton.click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, {
      timeout: 10000,
    });
  });

});