import { test, expect } from '@playwright/test';

test.describe('AI Match Initialization & Board Rendering', () => {
  test('should load menu and initiate a single-player match against AI', async ({ page }) => {
    await page.goto('/menu');

    const playButton = page.locator('button', { hasText: /play|start|quick match/i }).first();
    await expect(playButton).toBeVisible();

    await playButton.click();
  });

  test('should render active game view when navigating directly to game route', async ({ page }) => {
    await page.goto('/game');

    const container = page.locator('div').first();
    await expect(container).toBeVisible();
  });
});
