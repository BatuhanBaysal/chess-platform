import { test, expect } from './setup';

test.describe('Authentication & Navigation Flow', () => {
  test('should redirect root path to login page when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should navigate across public views seamlessly', async ({ page }) => {
    await page.goto('/menu');

    await page.goto('/leaderboard');
    await expect(page).toHaveURL(/.*\/leaderboard/);

    await page.goto('/history');
    await expect(page).toHaveURL(/.*\/history/);
  });
});
