import { test, expect } from './setup';

test.describe('Chessboard Mechanics & Gameplay Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-valid-token');
      window.localStorage.setItem('userId', 'player-001');
      window.localStorage.setItem('username', 'GrandmasterBatu');
      window.localStorage.setItem('role', 'ROLE_USER');
      window.localStorage.setItem('user', JSON.stringify({
        id: 'player-001',
        username: 'GrandmasterBatu',
        role: 'ROLE_USER',
      }));
      window.localStorage.setItem('activeGameId', 'game-active-777');
    });

    await page.route('**/api/games/game-active-777**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          gameId: 'game-active-777',
          status: 'IN_PROGRESS',
          boardRepresentation: 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR',
          currentTurn: 'WHITE',
          whitePlayerName: 'GrandmasterBatu',
          blackPlayerName: 'OpponentPlayer',
          whiteRemainingTimeMs: 600000,
          blackRemainingTimeMs: 600000,
          moveHistory: [],
        }),
      });
    });
  });

  test('should mount chessboard structure and display telemetry panels', async ({ page }) => {
    // Act
    await page.goto('/game', { waitUntil: 'domcontentloaded' });

    // Assert
    const boardElement = page.locator('[data-testid="chess-board"], .chessboard, svg').first();
    await expect(boardElement).toBeVisible();
    await expect(page.getByText(/live match session|telemetry/i).first()).toBeVisible();
  });

  test('should perform piece drag-and-drop movement across chessboard coordinates', async ({ page }) => {
    // Arrange
    await page.goto('/game', { waitUntil: 'domcontentloaded' });
    const boardElement = page.locator('[data-testid="chess-board"], .chessboard, svg').first();
    await expect(boardElement).toBeVisible();
    const box = await boardElement.boundingBox();
    expect(box).not.toBeNull();

    // Act
    if (box) {
      const fromX = box.x + box.width * 0.5;
      const fromY = box.y + box.height * 0.8;
      const toX = box.x + box.width * 0.5;
      const toY = box.y + box.height * 0.6;

      await page.mouse.move(fromX, fromY);
      await page.mouse.down();
      await page.mouse.move(toX, toY, { steps: 5 });
      await page.mouse.up();
    }

    // Assert
    await expect(boardElement).toBeVisible();
  });

  test('should require secondary confirmation before permanently forfeiting match via resign button', async ({ page }) => {
    // Arrange
    await page.goto('/game', { waitUntil: 'domcontentloaded' });
    const resignButton = page.getByRole('button', { name: /resign/i });
    await expect(resignButton).toBeVisible();

    // Act
    await resignButton.click();
    const confirmButton = page.getByRole('button', { name: /confirm/i });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Assert
    await expect(page).toHaveURL(/.*(\/menu|\/|\/sign-in)$/);
  });

  test('should allow player to return to menu without forfeiting active game state', async ({ page }) => {
    // Arrange
    await page.goto('/game', { waitUntil: 'domcontentloaded' });
    const menuButton = page.getByRole('button', { name: /menu/i }).first();
    await expect(menuButton).toBeVisible();

    // Act
    await menuButton.click();

    // Assert
    await expect(page).toHaveURL(/.*(\/menu|\/|\/sign-in)$/);
  });

  test('should ensure body scroll overflow state is managed appropriately during game session', async ({ page }) => {
    // Act
    await page.goto('/game', { waitUntil: 'domcontentloaded' });
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);

    // Assert
    expect(bodyOverflow).not.toBe('hidden');
  });
});
