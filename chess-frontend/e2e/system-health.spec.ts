import { test, expect } from './setup';

test.describe('System Information & Static Pages', () => {
  test('should display informational pages without errors', async ({ page }) => {
    await page.goto('/system-health');
    await expect(page).toHaveURL(/.*\/system-health/);

    await page.goto('/about');
    await expect(page).toHaveURL(/.*\/about/);

    await page.goto('/changelog');
    await expect(page).toHaveURL(/.*\/changelog/);

    await page.goto('/contact');
    await expect(page).toHaveURL(/.*\/contact/);
  });
});
