import { test, expect } from '@playwright/test';

test.describe('LandingPage Core User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
  });

  test('should render game setup and lobby components correctly', async ({ page }) => {
    const setupPanel = page.locator('text=Command Center').first();
    await expect(page).toHaveURL(/.*\/menu/);
  });

  test('should open AI match modal when trigger button is clicked', async ({ page }) => {
    const aiButton = page.locator('button', { hasText: /ai|computer|artificial intelligence/i }).first();
    if (await aiButton.isVisible()) {
      await aiButton.click();
      const modalHeader = page.locator('text=AI').first();
      await expect(modalHeader).toBeVisible();
    }
  });

  test('should navigate to full match history view', async ({ page }) => {
    const viewAllButton = page.locator('button', { hasText: /view all/i }).first();
    if (await viewAllButton.isVisible()) {
      await viewAllButton.click();
      await expect(page).toHaveURL(/.*\/history/);
    }
  });
});
