import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GameOverModal from './GameOverModal';

describe('GameOverModal Component', () => {
  it('renders victory title on opponent timeout', () => {
    // Arrange
    const handleBack = vi.fn();

    // Act
    render(
      <GameOverModal
        show={true}
        gameStatus="BLACK_TIMEOUT"
        currentTurn="BLACK"
        orientation="WHITE"
        onBackToMenu={handleBack}
      />
    );

    // Assert
    expect(screen.getByText('Victory!')).toBeDefined();
    expect(screen.getByText(/opponent's time limit has expired/i)).toBeDefined();

    // Act
    fireEvent.click(screen.getByRole('button', { name: /return to menu/i }));

    // Assert
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('renders draw title on stalemate', () => {
    // Arrange & Act
    render(
      <GameOverModal
        show={true}
        gameStatus="STALEMATE"
        currentTurn="WHITE"
        orientation="WHITE"
        onBackToMenu={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByText('Draw!')).toBeDefined();
    expect(screen.getByText(/game ended in a stalemate/i)).toBeDefined();
  });

  it('handles Escape keydown event to dismiss modal', () => {
    // Arrange
    const handleBack = vi.fn();
    render(
      <GameOverModal
        show={true}
        gameStatus="ABANDONED"
        currentTurn="WHITE"
        orientation="WHITE"
        onBackToMenu={handleBack}
      />
    );

    // Act
    fireEvent.keyDown(window, { key: 'Escape' });

    // Assert
    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
