import { test, expect } from './setup';

test.describe('User Profile & Account Settings', () => {
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

    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'grandmaster_batu',
          email: 'batu@chessplatform.com',
          eloRating: 1450,
          totalWins: 12,
          totalLosses: 4,
          totalDraws: 4,
          avatarUrl: null,
        }),
      });
    });

    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  });

  test('should render profile settings view and display current account details', async ({ page }) => {
    // Assert
    await expect(page.getByRole('heading', { name: /PROFILE SETTINGS/i })).toBeVisible();
    await expect(page.locator('#profile-username')).toHaveValue('grandmaster_batu');
    await expect(page.locator('#profile-email')).toHaveValue('batu@chessplatform.com');
    await expect(page.locator('#profile-username')).toBeDisabled();
    await expect(page.locator('#profile-email')).toBeDisabled();
  });

  test('should enable input fields when clicking edit profile and toggle back on cancel', async ({ page }) => {
    // Arrange
    const editBtn = page.getByRole('button', { name: /EDIT PROFILE/i });
    const usernameInput = page.locator('#profile-username');

    // Act
    await editBtn.click();

    // Assert
    await expect(usernameInput).toBeEnabled();
    const cancelBtn = page.getByRole('button', { name: /CANCEL/i });
    await expect(cancelBtn).toBeVisible();

    // Act
    await cancelBtn.click();

    // Assert
    await expect(usernameInput).toBeDisabled();
  });

  test('should validate password strength indicators in security credentials section', async ({ page }) => {
    // Arrange
    const currentPassInput = page.getByPlaceholder('Current Password');
    const newPassInput = page.getByPlaceholder('New Password');
    const changePassBtn = page.getByRole('button', { name: /CHANGE PASSWORD/i });

    // Assert
    await expect(changePassBtn).toBeDisabled();

    // Act
    await currentPassInput.fill('OldPassword123');
    await newPassInput.fill('weak');

    // Assert
    await expect(changePassBtn).toBeDisabled();

    // Act
    await newPassInput.fill('StrongPassword1');

    // Assert
    await expect(changePassBtn).toBeEnabled();
  });

  test('should toggle password visibility in danger zone input', async ({ page }) => {
    // Arrange
    const deletePassInput = page.getByPlaceholder('Confirm password to delete');
    const toggleBtn = deletePassInput.locator('..').locator('button[type="button"]');

    // Assert
    await expect(deletePassInput).toHaveAttribute('type', 'password');

    // Act
    await toggleBtn.click();

    // Assert
    await expect(deletePassInput).toHaveAttribute('type', 'text');
  });
});
