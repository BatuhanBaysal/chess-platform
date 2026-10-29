import { test, expect } from './setup';

test.describe('Matchmaking Lobby & Waiting Room Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-user-token');
      window.localStorage.setItem('userId', '1');
      window.localStorage.setItem('username', 'grandmaster_batu');
      window.localStorage.setItem('role', 'ROLE_USER');
      window.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'grandmaster_batu',
        role: 'ROLE_USER',
      }));
    });

    await page.route('**/api/lobby/rooms', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/menu', { waitUntil: 'domcontentloaded' });
  });

  test('should trigger room creation, open waiting room modal, and display room metadata', async ({ page }) => {
    // Arrange
    await page.route('**/api/lobby/create', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ roomId: 'ROOM-B2K-777' }),
      });
    });

    await page.route('**/api/lobby/status/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'WAITING' }),
      });
    });

    const findMatchBtn = page.getByRole('button', { name: /FIND MATCH \(ONLINE\)/i });

    // Act
    await findMatchBtn.click();

    // Assert
    const dialogModal = page.locator('dialog');
    await expect(dialogModal.getByRole('heading', { name: /SEARCHING OPPONENT/i })).toBeVisible();
    await expect(dialogModal.getByText('ROOM-B2K-777')).toBeVisible();
    await expect(dialogModal.getByText(/10 MIN/i)).toBeVisible();
    await expect(dialogModal.getByRole('button', { name: /CANCEL MATCHMAKING/i })).toBeVisible();
  });

  test('should cancel matchmaking and close modal when clicking cancel button', async ({ page }) => {
    // Arrange
    await page.route('**/api/lobby/create', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ roomId: 'ROOM-CANCEL-123' }),
      });
    });

    await page.route('**/api/lobby/status/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'WAITING' }),
      });
    });

    await page.route('**/api/lobby/cancel/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    const findMatchBtn = page.getByRole('button', { name: /FIND MATCH \(ONLINE\)/i });
    await findMatchBtn.click();

    const dialogModal = page.locator('dialog');
    await expect(dialogModal.getByRole('heading', { name: /SEARCHING OPPONENT/i })).toBeVisible();

    // Act
    const cancelBtn = dialogModal.getByRole('button', { name: /CANCEL MATCHMAKING/i });
    await expect(cancelBtn).toBeVisible();
    await expect(cancelBtn).toBeEnabled();
    await cancelBtn.click();

    // Assert
    await expect(dialogModal).not.toBeVisible();
    await expect(page).toHaveURL(/.*\/menu/);
  });
});
