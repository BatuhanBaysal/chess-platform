import { test, expect } from './setup';

declare const process: {
  env: Record<string, string | undefined>;
};

test.describe('System Information & Static Pages', () => {
  test('should display static informational pages without errors', async ({ page }) => {
    // Arrange & Act
    await page.goto('/about', { waitUntil: 'domcontentloaded' });

    // Assert
    await expect(page).toHaveURL(/.*\/about/);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Arrange & Act
    await page.goto('/changelog', { waitUntil: 'domcontentloaded' });

    // Assert
    await expect(page).toHaveURL(/.*\/changelog/);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Arrange & Act
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });

    // Assert
    await expect(page).toHaveURL(/.*\/contact/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should verify system health visibility according to environment policy', async ({ page }) => {
    // Arrange
    const env = typeof process !== 'undefined' ? process.env : {};
    const isProduction = env.NODE_ENV === 'production' || env.PROD === 'true';

    // Act
    await page.goto('/system-health', { waitUntil: 'domcontentloaded' });

    // Assert
    if (isProduction) {
      await expect(page).not.toHaveURL(/.*\/system-health/);
    } else {
      await expect(page).toHaveURL(/.*\/system-health/);
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });
});
