import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PromotionModal from './PromotionModal';

describe('PromotionModal Component', () => {
  const dummyImages = {
    Q: 'queen.png',
    R: 'rook.png',
    B: 'bishop.png',
    N: 'knight.png',
    q: 'b_queen.png',
    r: 'b_rook.png',
    b: 'b_bishop.png',
    n: 'b_knight.png',
  };

  it('calls onSelectPromotion when knight piece is clicked', () => {
    // Arrange
    const handleSelect = vi.fn();

    // Act
    render(
      <PromotionModal
        orientation="WHITE"
        pieceImages={dummyImages}
        onSelectPromotion={handleSelect}
      />
    );

    // Assert
    expect(screen.getByText(/white pawn promotion/i)).toBeDefined();

    // Act
    fireEvent.click(screen.getByRole('button', { name: /knight/i }));

    // Assert
    expect(handleSelect).toHaveBeenCalledWith('KNIGHT');
  });

  it('triggers promotion selection for all keys: Q, R, B, N', () => {
    // Arrange
    const handleSelect = vi.fn();
    render(
      <PromotionModal
        orientation="BLACK"
        pieceImages={dummyImages}
        onSelectPromotion={handleSelect}
      />
    );

    // Act & Assert
    fireEvent.keyDown(window, { key: 'q' });
    expect(handleSelect).toHaveBeenCalledWith('QUEEN');

    fireEvent.keyDown(window, { key: 'r' });
    expect(handleSelect).toHaveBeenCalledWith('ROOK');

    fireEvent.keyDown(window, { key: 'b' });
    expect(handleSelect).toHaveBeenCalledWith('BISHOP');

    fireEvent.keyDown(window, { key: 'n' });
    expect(handleSelect).toHaveBeenCalledWith('KNIGHT');
  });

  it('renders fallback textual icon when piece image fails to load', () => {
    // Arrange
    const handleSelect = vi.fn();
    render(
      <PromotionModal
        orientation="WHITE"
        pieceImages={dummyImages}
        onSelectPromotion={handleSelect}
      />
    );

    const queenImg = screen.getByAltText('QUEEN');

    // Act
    fireEvent.error(queenImg);

    // Assert
    expect(screen.getByText('Q')).toBeDefined();
  });
});
