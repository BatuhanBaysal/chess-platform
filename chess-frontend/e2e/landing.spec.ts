import { test, expect } from '@playwright/test';

test.describe('Dashboard & Landing Page (Master Plan v2.6.0)', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('/menu');
  });

  test('should render core dashboard modules and action triggers correctly', async ({ page }) => {
    // Arrange
    const findMatchBtn = page.getByRole('button', { name: /FIND MATCH \(ONLINE\)/i });
    const playVsComputerBtn = page.getByRole('button', { name: /PLAY VS COMPUTER/i });
    const playerDashboardHeading = page.getByRole('heading', { name: /PLAYER DASHBOARD/i });
    const activeRoomsHeading = page.getByRole('heading', { name: /ACTIVE ROOMS/i });
    const topPlayersHeading = page.getByRole('heading', { name: /TOP PLAYERS/i });
    const matchHistoryHeading = page.getByRole('heading', { name: /MATCH HISTORY/i });

    // Act
    await page.waitForLoadState('networkidle');

    // Assert
    await expect(findMatchBtn).toBeVisible();
    await expect(playVsComputerBtn).toBeVisible();
    await expect(playerDashboardHeading).toBeVisible();
    await expect(activeRoomsHeading).toBeVisible();
    await expect(topPlayersHeading).toBeVisible();
    await expect(matchHistoryHeading).toBeVisible();
  });

  test('should navigate to Full Leaderboard view when clicking Top Players View All', async ({ page }) => {
    // Arrange
    const topPlayersContainer = page.locator('div', { hasText: /^TOP PLAYERS/i }).first();
    const viewAllBtn = topPlayersContainer.getByRole('button', { name: /VIEW ALL/i });

    // Act
    await viewAllBtn.click();

    // Assert
    await expect(page).toHaveURL(/\/leaderboard/);
    await expect(page.getByRole('heading', { name: /GLOBAL RANKINGS/i })).toBeVisible();
  });

  test('should navigate to Match History view when clicking Match History View All', async ({ page }) => {
    // Arrange
    const matchHistoryContainer = page.locator('div', { hasText: /^MATCH HISTORY/i }).first();
    const viewAllBtn = matchHistoryContainer.getByRole('button', { name: /VIEW ALL/i });

    // Act
    await viewAllBtn.click();

    // Assert
    await expect(page).toHaveURL(/\/history/);
    await expect(page.getByRole('heading', { name: /MATCH HISTORY/i })).toBeVisible();
  });

  test('should not generate horizontal scrollbar on mobile viewport (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Act
    await page.goto('/menu', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    // Assert
    expect(hasHorizontalOverflow).toBe(false);
  });
});
