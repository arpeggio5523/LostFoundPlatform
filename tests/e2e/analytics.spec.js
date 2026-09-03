import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard Page', () => {

  test.setTimeout(60000);

  // =========================================================
  // ADMIN AUTHENTICATION
  // =========================================================

  test.beforeEach(async ({ page }) => {

    // Mock admin authentication
    await page.context().addInitScript(() => {
      localStorage.setItem('token', 'mock-token-123');

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'admin123',
          role: 'Admin',
          email: 'admin@test.com',
          fullName: 'Test Admin',
        })
      );
    });

    // Mock messages API used by the Sidebar to prevent 401 redirects
    await page.route('**/api/messages/conversations*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });
  });


  // =========================================================
  // TEST 1: LOAD ANALYTICS
  // =========================================================

  test('should load analytics dashboard and display data', async ({ page }) => {

    // Mock analytics API
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

    await page.goto('/analytics', {
      waitUntil: 'domcontentloaded',
    });

    // Check that admin stays on analytics
    await expect(page).toHaveURL(/\/analytics/, {
      timeout: 5000,
    });

    // Debug: current URL
    console.log('Current URL:', page.url());

    // Debug: page content
    const content = await page.textContent('body');
    console.log(
      'Page content (first 500 chars):',
      content?.substring(0, 500)
    );

    // Debug: screenshot
    await page.screenshot({
      path: 'analytics-test-debug.png',
    });

    console.log('Screenshot saved: analytics-test-debug.png');

    // Check Posts statistics
    const postsStats = page.getByText('Posts statistics');

    const isVisible = await postsStats
      .isVisible()
      .catch(() => false);

    console.log(
      'Posts statistics visible:',
      isVisible
    );

    if (!isVisible) {
      const h2s = await page.locator('h2').allTextContents();

      console.log('All h2 texts:', h2s);

      throw new Error(
        `Posts statistics not found. Page h2s: ${h2s.join(', ')}`
      );
    }

    await expect(postsStats).toBeVisible({
      timeout: 10000,
    });

    // Check moderation status
    await expect(
      page.getByRole('heading', { name: 'Moderation status' })
    ).toBeVisible({
      timeout: 10000,
    });

    // Check status labels
    await expect(
      page.getByText('Pending')
    ).toBeVisible({
      timeout: 5000,
    });

    await expect(
      page.getByText('Approved')
    ).toBeVisible({
      timeout: 5000,
    });

  });


  // =========================================================
  // TEST 2: REFRESH ANALYTICS
  // =========================================================

  test('should refresh analytics on button click', async ({ page }) => {

    let callCount = 0;

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

    await page.goto('/analytics', {
      waitUntil: 'domcontentloaded',
    });

    // Make sure analytics loaded
    await expect(
      page.getByText('Posts statistics')
    ).toBeVisible();

    // Find refresh button
    const refreshButton = page.locator(
      'button[title="Refresh analytics"]'
    );

    await expect(refreshButton).toBeVisible();

    // Initial API call
    expect(callCount).toBeGreaterThanOrEqual(1);

    const callsBeforeRefresh = callCount;

    // Click refresh
    await refreshButton.click();

    // Wait for another API call
    await expect
      .poll(() => callCount, {
        timeout: 10000,
      })
      .toBeGreaterThan(callsBeforeRefresh);

    expect(callCount).toBeGreaterThanOrEqual(2);

  });


  // =========================================================
  // TEST 3: NON-ADMIN USER
  // =========================================================

  test('should redirect non-admin users away from analytics', async ({ browser }) => {

    // Create a completely separate context.
    // This prevents the admin authentication from beforeEach
    // from being used in this test.

    const context = await browser.newContext();

    await context.addInitScript(() => {

      localStorage.setItem(
        'token',
        'mock-token'
      );

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'user123',
          role: 'User',
          email: 'user@test.com',
        })
      );

    });

    const page = await context.newPage();

    await page.goto('/analytics', {
      waitUntil: 'domcontentloaded',
    });

    // Non-admin users should NOT remain on analytics.
    // Change this to /login or another page if that is
    // the actual behaviour of your application.

    await expect(page).toHaveURL(/\/$/, {
      timeout: 10000,
    });

    await context.close();

  });

  // =========================================================
  // TEST 4: API FAILURE
  // =========================================================

  test('should display error message on API failure', async ({ page }) => {

    await page.route('**/api/analytics', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/analytics', {
      waitUntil: 'domcontentloaded',
    });

    await expect(
      page.getByText(/Failed to fetch/i)
    ).toBeVisible({
      timeout: 10000,
    });

  });


  // =========================================================
  // TEST 5: LOGOUT
  // =========================================================

  test('should logout on logout button click', async ({ page }) => {

    // Mock analytics API
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

    await page.goto('/analytics', {
      waitUntil: 'domcontentloaded',
    });

    // Make sure analytics loaded
    await expect(
      page.getByText('Posts statistics')
    ).toBeVisible();

    // Find logout button
    const logoutButton = page.getByRole('button', {
      name: 'Logout',
    });

    await expect(logoutButton).toBeVisible();

    // Logout
    await logoutButton.click();

    // Should go to login
    await expect(page).toHaveURL(/\/login/, {
      timeout: 10000,
    });

  });

});