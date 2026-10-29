import { test, expect } from './setup';

test.describe('Admin Route Access & Role Protection', () => {
  test('should redirect unauthenticated guest to sign-in page when accessing admin route directly', async ({ page }) => {
    // Arrange
    await page.context().clearCookies();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.localStorage.clear());

    // Act
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Assert
    await expect(page).toHaveURL(/.*\/sign-in/);
  });

  test('should prevent guest user from accessing admin route and verify admin link is hidden', async ({ page }) => {
    // Arrange
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-guest-token');
      window.localStorage.setItem('userId', 'guest-101');
      window.localStorage.setItem('username', 'guest_batu');
      window.localStorage.setItem('role', 'ROLE_GUEST');
      window.localStorage.setItem('user', JSON.stringify({
        id: 'guest-101',
        username: 'guest_batu',
        role: 'ROLE_GUEST',
      }));
    });

    // Act
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Assert
    await expect(page.locator('header a[href="/admin"]')).toHaveCount(0);

    // Act
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Assert
    await expect(page).not.toHaveURL(/.*\/admin/);
  });

  test('should block regular registered user from accessing admin panel', async ({ page }) => {
    // Arrange
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-user-jwt-token');
      window.localStorage.setItem('userId', 'user-456');
      window.localStorage.setItem('username', 'player_one');
      window.localStorage.setItem('role', 'ROLE_USER');
      window.localStorage.setItem('user', JSON.stringify({
        id: 'user-456',
        username: 'player_one',
        role: 'ROLE_USER',
      }));
    });

    // Act
    await page.goto('/menu', { waitUntil: 'domcontentloaded' });

    // Assert
    await expect(page.locator('header a[href="/admin"]')).toHaveCount(0);

    // Act
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Assert
    await expect(page).not.toHaveURL(/.*\/admin/);
  });

  test('should grant access to admin panel and display admin navigation item for ROLE_ADMIN', async ({ page }) => {
    test.slow();

    // Arrange
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-admin-valid-token');
      window.localStorage.setItem('userId', 'admin-001');
      window.localStorage.setItem('username', 'admin');
      window.localStorage.setItem('role', 'ROLE_ADMIN');
      window.localStorage.setItem('user', JSON.stringify({
        id: 'admin-001',
        username: 'admin',
        role: 'ROLE_ADMIN',
      }));
    });

    // Act
    await page.goto('/menu', { waitUntil: 'domcontentloaded' });
    const adminNavLink = page.locator('header a[href="/admin"]').first();

    // Assert
    await expect(adminNavLink).toBeVisible({ timeout: 15000 });

    // Act
    await adminNavLink.click();

    // Assert
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test('should immediately revoke access if session credentials are cleared while on admin page', async ({ page }) => {
    // Arrange
    await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      window.localStorage.setItem('token', 'mock-admin-valid-token');
      window.localStorage.setItem('userId', 'admin-001');
      window.localStorage.setItem('username', 'admin');
      window.localStorage.setItem('role', 'ROLE_ADMIN');
      window.localStorage.setItem('user', JSON.stringify({
        id: 'admin-001',
        username: 'admin',
        role: 'ROLE_ADMIN',
      }));
    });

    // Act
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Assert
    await expect(page).toHaveURL(/.*\/admin/);

    // Act
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Assert
    await expect(page).toHaveURL(/.*\/sign-in/);
  });
});
