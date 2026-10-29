import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import * as userService from '../../api/userService';
import * as chessHook from '../chess/hooks/useChess';

vi.mock('../../api/userService', () => ({
  getMyProfile: vi.fn(),
}));

vi.mock('../chess/hooks/useChess', () => ({
  useChess: vi.fn(),
}));

vi.mock('../chess/components/ChessBoard', () => ({
  default: ({ onBackToMenu, onMove }: any) => (
    <div data-testid="mock-chessboard">
      <button onClick={onBackToMenu}>Exit to Menu</button>
      <button onClick={() => onMove(1, 1, 2, 2, 'QUEEN')}>Trigger Move</button>
    </div>
  ),
}));

describe('Dashboard Component', () => {
  const mockMakeMove = vi.fn();
  const mockFetchLegalMoves = vi.fn();
  const mockResetChessState = vi.fn();

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();

    vi.mocked(chessHook.useChess).mockReturnValue({
      game: null,
      makeMove: mockMakeMove,
      fetchLegalMoves: mockFetchLegalMoves,
      resetChessState: mockResetChessState,
    } as any);

    vi.mocked(userService.getMyProfile).mockResolvedValue({
      username: 'grandmaster',
      eloRating: 1450,
      totalWins: 12,
      totalLosses: 4,
      totalDraws: 4,
    } as any);
  });

  it('renders stats metrics and distribution card when profile loads', async () => {
    // Arrange & Act
    render(<Dashboard userId={1} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('1450')).toBeDefined();
      expect(screen.getAllByText('12').length).toBeGreaterThan(0);
      expect(screen.getAllByText('4').length).toBeGreaterThan(0);
      expect(screen.getByText('60% WIN RATE')).toBeDefined();
      expect(screen.getByText(/rating system:/i)).toBeDefined();
    });
  });

  it('renders fallback state when match data has zero games', async () => {
    // Arrange
    vi.mocked(userService.getMyProfile).mockResolvedValueOnce({
      username: 'newbie',
      eloRating: 1200,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
    } as any);

    // Act
    render(<Dashboard userId={1} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/no match data yet/i)).toBeDefined();
      expect(screen.getByText('0% WIN RATE')).toBeDefined();
    });
  });

  it('renders active live match board when game and activeLobbyId exist', async () => {
    // Arrange
    vi.mocked(chessHook.useChess).mockReturnValue({
      game: {
        boardRepresentation: 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR',
        isStarted: true,
        status: 'IN_PROGRESS',
        currentTurn: 'WHITE',
        moveHistory: [],
        lastMoveMessage: '',
      },
      makeMove: mockMakeMove,
      fetchLegalMoves: mockFetchLegalMoves,
      resetChessState: mockResetChessState,
    } as any);

    // Act
    render(<Dashboard userId={1} activeLobbyId="lobby-777" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('mock-chessboard')).toBeDefined();
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /trigger move/i }));

    // Assert
    await waitFor(() => {
      expect(mockMakeMove).toHaveBeenCalledWith('lobby-777', 1, 1, 2, 2, 'QUEEN');
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /exit to menu/i }));

    // Assert
    await waitFor(() => {
      expect(mockResetChessState).toHaveBeenCalledTimes(1);
    });
  });

  it('invokes resetChessState on component unmount', async () => {
    // Arrange
    const { unmount } = render(<Dashboard userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('1450')).toBeDefined();
    });

    // Act
    unmount();

    // Assert
    expect(mockResetChessState).toHaveBeenCalledTimes(1);
  });
});
