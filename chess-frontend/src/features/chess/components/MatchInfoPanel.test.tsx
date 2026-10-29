import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchInfoPanel from './MatchInfoPanel';

describe('MatchInfoPanel Component', () => {
  const defaultProps = {
    orientation: 'WHITE' as const,
    currentTurn: 'WHITE',
    isGameOver: false,
    whiteRemainingTimeMs: 180000,
    blackRemainingTimeMs: 120000,
    whiteCaptured: ['p', 'n'],
    blackCaptured: ['P', 'Q'],
    pieceImages: {
      P: '/assets/pieces/wP.svg',
      Q: '/assets/pieces/wQ.svg',
      p: '/assets/pieces/bP.svg',
      n: '/assets/pieces/bN.svg',
    },
    formatTime: (ms: number) => `${Math.floor(ms / 60000)}:00`,
    onDismissGame: vi.fn(),
    score: 150,
    evaluationType: 'CP' as const,
    hintData: null,
    isHintLoading: false,
    onGetHint: vi.fn(),
    isMyTurn: true,
    whitePlayerName: 'batuhan',
    blackPlayerName: 'OpponentUser',
    whiteAvatarUrl: '/avatars/batuhan.png',
    blackAvatarUrl: '/avatars/opponent.png',
    game: {
      gameId: 'game-123',
      roomId: 'room-123',
      whiteId: 1,
      blackId: 2,
    },
  };

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders players info, timers and captured pieces properly', () => {
    // Arrange & Act
    render(<MatchInfoPanel {...defaultProps} />);

    // Assert
    expect(screen.getByText('batuhan')).toBeDefined();
    expect(screen.getByText('OpponentUser')).toBeDefined();
    expect(screen.getByText('3:00')).toBeDefined();
    expect(screen.getByText('2:00')).toBeDefined();
    expect(screen.getAllByAltText('cap')).toHaveLength(4);
  });

  it('triggers onDismissGame callback when dismiss button is clicked', () => {
    // Arrange
    const handleDismiss = vi.fn();
    render(<MatchInfoPanel {...defaultProps} onDismissGame={handleDismiss} />);

    // Act
    const dismissBtn = screen.getByTitle('Dismiss Game');
    fireEvent.click(dismissBtn);

    // Assert
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('triggers onGetHint callback when smart hint button is clicked on my turn', () => {
    // Arrange
    const handleGetHint = vi.fn();
    render(<MatchInfoPanel {...defaultProps} onGetHint={handleGetHint} isMyTurn={true} />);

    // Act
    const hintBtn = screen.getByRole('button', { name: /get smart hint/i });
    fireEvent.click(hintBtn);

    // Assert
    expect(handleGetHint).toHaveBeenCalledTimes(1);
  });

  it('disables hint button when it is not my turn or hint is loading', () => {
    // Arrange & Act
    render(<MatchInfoPanel {...defaultProps} isMyTurn={false} isHintLoading={true} />);

    // Assert
    const hintBtn = screen.getByRole('button', { name: /calculating.../i });
    expect((hintBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('displays Stockfish recommendation when hintData is present and clears after timer', () => {
    // Arrange
    vi.useFakeTimers();
    const hint = {
      bestMoveUci: 'e2e4',
      message: 'Great move',
      evaluationScore: 120,
    };

    // Act
    render(<MatchInfoPanel {...defaultProps} hintData={hint} />);

    // Assert
    expect(screen.getByText('e2e4')).toBeDefined();

    // Act
    act(() => {
      vi.advanceTimersByTime(4100);
    });

    // Assert
    expect(screen.queryByText('e2e4')).toBeNull();

    vi.useRealTimers();
  });

  it('resolves AI player name and difficulty when game is vs AI', () => {
    // Arrange
    const aiGameProps = {
      ...defaultProps,
      blackPlayerName: undefined,
      game: {
        gameType: 'AI',
        aiDifficulty: 4,
        blackId: -1,
      },
    };

    // Act
    render(<MatchInfoPanel {...aiGameProps} />);

    // Assert
    expect(screen.getByText('Stockfish (Lv. 4)')).toBeDefined();
  });

  it('resolves opponent fallback name from game object candidates and stored username', () => {
    // Arrange
    localStorage.setItem('username', 'batuhan_local');
    const fallbackProps = {
      ...defaultProps,
      whitePlayerName: undefined,
      blackPlayerName: undefined,
      game: {
        whiteUsername: 'white_nested',
        blackPlayerUsername: 'black_nested',
      },
    };

    // Act
    render(<MatchInfoPanel {...fallbackProps} />);

    // Assert
    expect(screen.getByText('white_nested')).toBeDefined();
    expect(screen.getByText('black_nested')).toBeDefined();
  });

  it('handles image error fallback for captured pieces and avatars', () => {
    // Arrange
    const { container } = render(<MatchInfoPanel {...defaultProps} />);
    const capturedImages = screen.getAllByAltText('cap');

    // Act
    fireEvent.error(capturedImages[0]);

    // Assert
    expect(container.querySelector('.font-mono.opacity-60')).toBeDefined();
  });
});
