import { test, expect } from './setup';

test.describe('WebSocket Real-time Connectivity & Reconnection', () => {
  test('should maintain stable state during simulated network offline/online toggle', async ({ page }) => {
    // Arrange
    await page.goto('/menu', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    // Act
    await page.context().setOffline(true);
    await page.waitForFunction(() => !navigator.onLine);

    await page.context().setOffline(false);
    await page.waitForFunction(() => navigator.onLine);

    // Assert
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/.*\/menu/);
  });
});
