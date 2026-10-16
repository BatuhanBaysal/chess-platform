import { test, expect } from '@playwright/test';

test.describe('AI Match Configuration Modal Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('/menu');
  });

  test('should open AI modal, display unrated banner, and lock background scroll', async ({ page }) => {
    // Arrange
    const playVsComputerBtn = page.getByRole('button', { name: /PLAY VS COMPUTER/i });

    // Act
    await playVsComputerBtn.click();

    // Assert
    const modalHeading = page.getByRole('heading', { name: /CONFIGURE AI MATCH/i });
    const unratedBanner = page.getByText(/CASUAL MATCH • UNRATED/i);
    const startMatchBtn = page.getByRole('button', { name: /START MATCH/i });

    await expect(modalHeading).toBeVisible();
    await expect(unratedBanner).toBeVisible();
    await expect(startMatchBtn).toBeVisible();

    const isScrollLocked = await page.evaluate(() => {
      return (
        document.body.style.overflow === 'hidden' &&
        document.documentElement.style.overflow === 'hidden'
      );
    });
    expect(isScrollLocked).toBe(true);
  });

  test('should close modal and restore scroll locks when pressing Escape', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: /PLAY VS COMPUTER/i }).click();
    await expect(page.getByRole('heading', { name: /CONFIGURE AI MATCH/i })).toBeVisible();

    // Act
    await page.keyboard.press('Escape');

    // Assert
    await expect(page.getByRole('heading', { name: /CONFIGURE AI MATCH/i })).not.toBeVisible();

    const isScrollRestored = await page.evaluate(() => {
      return (
        document.body.style.overflow === '' &&
        document.documentElement.style.overflow === ''
      );
    });
    expect(isScrollRestored).toBe(true);
  });

  test('should update time controls and difficulty levels in configuration state', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: /PLAY (VS )?COMPUTER/i }).click();

    // Act
    const timeBtn3Min = page.getByRole('button', { name: /^3 MIN$/i }).first();
    const level5Btn = page.getByRole('button', { name: /^LEVEL 5$/i });

    await timeBtn3Min.click();
    await level5Btn.click();

    // Assert
    await expect(timeBtn3Min).toHaveClass(/bg-indigo-600/);
    await expect(level5Btn).toHaveClass(/bg-indigo-600/);
  });
});
