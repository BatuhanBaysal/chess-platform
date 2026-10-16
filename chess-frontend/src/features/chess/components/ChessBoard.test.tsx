import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { ChessBoard } from './ChessBoard';

describe('ChessBoard Component', () => {
  beforeAll(() => {
    Element.prototype.scrollTo = vi.fn();
  });

  const baseProps = {
    boardRepresentation: 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR',
    isStarted: true,
    gameStatus: 'ACTIVE',
    currentTurn: 'WHITE' as const,
    moveHistory: [],
    lastMoveMessage: '',
    onMove: vi.fn(),
    fetchLegalMoves: async () => [],
    onBackToMenu: vi.fn(),
    onNewGame: vi.fn(),
    theme: 'modern' as const,
    timeLimit: 10,
    orientation: 'WHITE' as const,
    whiteRemainingTimeMs: 600000,
    blackRemainingTimeMs: 600000,
    hintData: null,
    isHintLoading: false,
    onGetHint: vi.fn(),
    evaluationScore: 0,
    evaluationType: 'CP' as const,
    isMyTurn: true,
  };

  it('renders active board and side telemetry tabs in happy path', () => {
    // Arrange
    const props = { ...baseProps };

    // Act
    render(<ChessBoard {...props} />);

    // Assert
    expect(screen.getByText(/telemetry/i)).toBeDefined();
    expect(screen.getAllByText(/notation/i).length).toBeGreaterThan(0);
  });

  it('displays defeat modal when match ends with checkmate against user', async () => {
    // Arrange
    const props = {
      ...baseProps,
      gameStatus: 'CHECKMATE',
      currentTurn: 'WHITE' as const,
      orientation: 'WHITE' as const,
    };

    // Act
    render(<ChessBoard {...props} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/defeat!/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /return to menu/i })).toBeDefined();
    }, { timeout: 2500 });
  });

  it('invokes onBackToMenu callback when clicking return to menu button', async () => {
    // Arrange
    const handleBackToMenu = vi.fn();
    const props = {
      ...baseProps,
      gameStatus: 'CHECKMATE',
      currentTurn: 'WHITE' as const,
      orientation: 'WHITE' as const,
      onBackToMenu: handleBackToMenu,
    };
    render(<ChessBoard {...props} />);

    // Act
    const returnButton = await screen.findByRole('button', { name: /return to menu/i }, { timeout: 2500 });
    fireEvent.click(returnButton);

    // Assert
    expect(handleBackToMenu).toHaveBeenCalledTimes(1);
  });
});
