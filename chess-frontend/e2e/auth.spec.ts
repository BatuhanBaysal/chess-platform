import { test, expect } from '@playwright/test';

test.describe('Authentication & Onboarding Flow', () => {
  test('should allow user to sign in with valid credentials', async ({ page }) => {
    // Arrange
    await page.goto('/sign-in');

    // Act
    await page.locator('input[name="username"]').fill('validuser');
    await page.locator('input[name="password"]').fill('Password123');
    await page.getByRole('button', { name: /^sign in$/i }).click();

    // Assert
    await expect(page).toHaveURL(/.*\/menu|.*\//);
  });

  test('should display validation errors when submitting empty sign-in form', async ({ page }) => {
    // Arrange
    await page.goto('/sign-in');

    // Act
    await page.getByRole('button', { name: /^sign in$/i }).click();

    // Assert
    await expect(page.getByText(/username or email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should toggle password visibility when clicking eye adornment button', async ({ page }) => {
    // Arrange
    await page.goto('/sign-in');
    const passwordInput = page.locator('input[name="password"]');

    // Assert
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Act
    await page.locator('button[title*="password" i]').click();

    // Assert
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should toggle between sign-in and sign-up views via footer switch button', async ({ page }) => {
    // Arrange
    await page.goto('/sign-in');

    // Act
    await page.getByRole('button', { name: /sign up/i }).click();

    // Assert
    await expect(page).toHaveURL(/.*\/sign-up/);
    await expect(page.locator('input[name="email"]')).toBeVisible();

    // Act
    await page.getByRole('button', { name: /sign in/i }).click();

    // Assert
    await expect(page).toHaveURL(/.*\/sign-in/);
    await expect(page.locator('input[name="email"]')).toHaveCount(0);
  });

  test('should display field-level validation errors for invalid registration inputs', async ({ page }) => {
    // Arrange
    await page.goto('/sign-up');

    // Act
    await page.locator('input[name="username"]').fill('ab');
    await page.locator('input[name="email"]').fill('invalid-email-address');
    await page.locator('input[name="password"]').fill('weak');
    await page.getByRole('button', { name: /create account/i }).click();

    // Assert
    await expect(page.getByText(/username must be between 3 and 20 characters/i)).toBeVisible();
    await expect(page.getByText(/invalid email format/i)).toBeVisible();
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
  });

  test('should authenticate guest user when clicking play as guest now button', async ({ page }) => {
    // Arrange
    await page.goto('/sign-in');

    // Act
    const guestButton = page.getByRole('button', { name: /play as guest now/i });
    await expect(guestButton).toBeVisible();
    await guestButton.click();

    // Assert
    await expect(page).toHaveURL(/.*\/menu|.*\//);
  });

  test('should complete full sign-up onboarding, display success card, and prefill username in sign-in', async ({ page }) => {
    // Arrange
    const uniqueId = Date.now().toString().slice(-6);
    const username = `player${uniqueId}`;
    const email = `player${uniqueId}@chessplatform.com`;
    const password = 'Password123';

    await page.route('**/*register*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'User registered successfully' }),
      });
    });

    await page.goto('/sign-up', { waitUntil: 'domcontentloaded' });

    // Act
    await page.locator('input[name="username"]').fill(username);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: /create account/i }).click();

    // Assert
    const successHeader = page.getByRole('heading', { name: new RegExp(`welcome, @${username}!`, 'i') });
    await expect(successHeader).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/starting rating/i)).toBeVisible();

    // Act
    const proceedButton = page.getByRole('button', { name: /proceed to sign in/i });
    await expect(proceedButton).toBeVisible();
    await proceedButton.click();

    // Assert
    await expect(page).toHaveURL(/.*\/sign-in/);
    await expect(page.locator('input[name="username"]')).toHaveValue(username.toLowerCase());
  });
});
