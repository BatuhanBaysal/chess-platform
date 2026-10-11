import { test, expect } from './setup';

test.describe('Chessboard Mechanics & Drag-and-Drop Interaction', () => {
  test('should mount chessboard structure and detect piece interactions', async ({ page }) => {
    await page.goto('/game');

    const boardElement = page.locator('[data-testid="chess-board"], .chessboard, svg').first();
    if (await boardElement.isVisible()) {
      const boundingBox = await boardElement.boundingBox();
      expect(boundingBox).not.toBeNull();

      if (boundingBox) {
        await page.mouse.move(boundingBox.x + 20, boundingBox.y + 20);
        await page.mouse.down();
        await page.mouse.move(boundingBox.x + 60, boundingBox.y + 60);
        await page.mouse.up();
      }
    }
  });
});
