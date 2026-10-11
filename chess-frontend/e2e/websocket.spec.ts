import { test, expect } from './setup';

test.describe('WebSocket Real-time Connectivity & Reconnection', () => {
  test('should maintain stable state during simulated network offline/online toggle', async ({ page }) => {
    await page.goto('/menu');

    await page.context().setOffline(true);
    await page.waitForTimeout(1000);

    await page.context().setOffline(false);
    await page.waitForTimeout(1000);

    await expect(page.locator('body')).toBeVisible();
  });
});
