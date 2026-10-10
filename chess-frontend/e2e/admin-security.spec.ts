import { test, expect } from './setup';

test.describe('Admin Route Access & Role Protection', () => {
  test('should guard admin dashboard against unauthenticated access', async ({ page }) => {
    await page.goto('/login');
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
