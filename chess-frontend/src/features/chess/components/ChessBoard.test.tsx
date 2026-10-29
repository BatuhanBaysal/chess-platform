import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { ChessBoard } from './ChessBoard';

describe('ChessBoard Component', () => {
  beforeAll(() => {
    // Arrange
    Element.prototype.scrollTo = vi.fn();
  });

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
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
    onDismissGame: vi.fn(),
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
    await waitFor(
      () => {
        expect(screen.getByText(/defeat!/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /return to menu/i })).toBeDefined();
      },
      { timeout: 2500 }
    );
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

  it('switches between Telemetry and Notation tabs when clicked', () => {
    // Arrange
    const props = {
      ...baseProps,
      moveHistory: ['e4', 'e5'],
    };
    render(<ChessBoard {...props} />);

    // Act
    const notationTabBtn = screen.getByRole('button', { name: /notation/i });
    fireEvent.click(notationTabBtn);

    // Assert
    expect(screen.getByText('e4')).toBeDefined();
    expect(screen.getByText('e5')).toBeDefined();

    // Act
    const telemetryTabBtn = screen.getByRole('button', { name: /telemetry/i });
    fireEvent.click(telemetryTabBtn);

    // Assert
    expect(screen.getByText(/game started/i)).toBeDefined();
  });

  it('triggers onGetHint when Get Smart Hint button is clicked on my turn', () => {
    // Arrange
    const handleGetHint = vi.fn();
    const props = {
      ...baseProps,
      isMyTurn: true,
      onGetHint: handleGetHint,
    };
    render(<ChessBoard {...props} />);

    // Act
    const hintButton = screen.getByRole('button', { name: /get smart hint/i });
    fireEvent.click(hintButton);

    // Assert
    expect(handleGetHint).toHaveBeenCalledTimes(1);
  });

  it('displays Stockfish suggested move when hintData is present', () => {
    // Arrange
    const props = {
      ...baseProps,
      hintData: {
        bestMoveUci: 'e2e4',
        message: 'Controls central squares',
        evaluationScore: 150,
      },
    };

    // Act
    render(<ChessBoard {...props} />);

    // Assert
    expect(screen.getByText('e2e4')).toBeDefined();
  });

  it('triggers onDismissGame callback when clicking dismiss button in header', () => {
    // Arrange
    const handleDismiss = vi.fn();
    const props = {
      ...baseProps,
      onDismissGame: handleDismiss,
    };
    render(<ChessBoard {...props} />);

    // Act
    const dismissButton = screen.getByTitle(/dismiss game/i);
    fireEvent.click(dismissButton);

    // Assert
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('displays synchronizing overlay when match is not started', () => {
    // Arrange
    const props = {
      ...baseProps,
      isStarted: false,
    };

    // Act
    render(<ChessBoard {...props} />);

    // Assert
    expect(screen.getByText(/synchronizing game/i)).toBeDefined();
  });

  it('renders promotion modal and calls onMove when promotion piece is selected', async () => {
    // Arrange
    const handleMove = vi.fn();
    const mockLegalMoves = vi.fn().mockResolvedValue([{ file: 0, rank: 7 }]);
    const promotionBoard = 'rnbqkbnrPppppppp................................PPPPPPPPRNBQKBNR';

    const props = {
      ...baseProps,
      boardRepresentation: promotionBoard,
      fetchLegalMoves: mockLegalMoves,
      onMove: handleMove,
    };
    render(<ChessBoard {...props} />);

    // Act
    fireEvent.click(screen.getByLabelText('Chess square 8'));

    // Assert
    await waitFor(() => {
      expect(mockLegalMoves).toHaveBeenCalledWith(0, 6);
    });

    // Act
    fireEvent.click(screen.getByLabelText('Chess square 0'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/white pawn promotion/i)).toBeDefined();
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /queen/i }));

    // Assert
    expect(handleMove).toHaveBeenCalledWith(0, 6, 0, 7, 'QUEEN');
  });
});
