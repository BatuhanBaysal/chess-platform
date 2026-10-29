import { test, expect } from './setup';

test.describe('Match History & PGN Replay Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-user-token');
      window.localStorage.setItem('userId', '1');
      window.localStorage.setItem('username', 'grandmaster_batu');
      window.localStorage.setItem('role', 'ROLE_USER');
    });

    await page.route('**/api/games/history/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 801,
            whitePlayerId: 1,
            whitePlayerName: 'grandmaster_batu',
            blackPlayerId: 2,
            blackPlayerName: 'magnus_carlsen',
            result: '1-0',
            finishMethod: 'CHECKMATE',
            playedAt: '2026-10-25T14:30:00Z',
          },
          {
            id: 802,
            whitePlayerId: 1,
            whitePlayerName: 'grandmaster_batu',
            blackPlayerId: null,
            blackPlayerName: 'Stockfish AI',
            result: '0-1',
            finishMethod: 'RESIGNATION',
            playedAt: '2026-10-26T18:00:00Z',
          },
        ]),
      });
    });

    await page.route('**/api/games/**/export/pgn**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: '[Event "Match"]\n[White "grandmaster_batu"]\n[Black "magnus_carlsen"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 1-0',
      });
    });

    await page.goto('/history', { waitUntil: 'domcontentloaded' });
  });

  test('should render match history view and default to ranked PvP tab', async ({ page }) => {
    // Assert
    await expect(page.getByRole('heading', { name: /MATCH HISTORY/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /RANKED \(PVP\)/i })).toBeVisible();
    await expect(page.getByText('magnus_carlsen')).toBeVisible();
    await expect(page.getByText('#801')).toBeVisible();
  });

  test('should switch between Ranked PvP and AI Practice tabs', async ({ page }) => {
    // Arrange
    const aiTabBtn = page.getByRole('button', { name: /AI PRACTICE/i });

    // Act
    await aiTabBtn.click();

    // Assert
    await expect(page.getByText('Stockfish AI')).toBeVisible();
    await expect(page.getByText('#802')).toBeVisible();
    await expect(page.getByText('magnus_carlsen')).toHaveCount(0);
  });

  test('should open match replay modal when replay button is clicked', async ({ page }) => {
    // Arrange
    const replayBtn = page.getByRole('button', { name: /replay/i }).first();
    await expect(replayBtn).toBeVisible();

    // Act
    await replayBtn.click();

    // Assert
    await expect(page.getByText(/match #801/i)).toBeVisible();
    await expect(page.getByText(/moves notation/i)).toBeVisible();
  });
});
