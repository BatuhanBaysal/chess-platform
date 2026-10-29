import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChess } from './useChess';
import { useChessSocket } from './useChessSocket';
import { useChessActions } from './useChessActions';
import { useChessTimer } from './useChessTimer';

vi.mock('./useChessSocket', () => ({
  useChessSocket: vi.fn(),
}));

vi.mock('./useChessActions', () => ({
  useChessActions: vi.fn(),
}));

vi.mock('./useChessTimer', () => ({
  useChessTimer: vi.fn(),
}));

describe('useChess Hook', () => {
  const mockConnectWebSocket = vi.fn();
  const mockDisconnectWebSocket = vi.fn();
  const mockConnectLobby = vi.fn();
  const mockDisconnectLobby = vi.fn();
  const mockBaseResetChessState = vi.fn();
  const mockScheduleGameStateUpdate = vi.fn();
  const mockSetGameOverResult = vi.fn();
  const mockSetGame = vi.fn();
  const mockSetError = vi.fn();
  const mockSetSelectedTheme = vi.fn();
  const mockMakeMove = vi.fn();
  const mockDismissGame = vi.fn();
  const mockFetchLegalMoves = vi.fn();
  const mockStartNewGame = vi.fn();
  const mockStartAiGame = vi.fn();
  const mockFetchHint = vi.fn();

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(useChessSocket).mockReturnValue({
      isConnected: false,
      isLobbyConnected: false,
      stompClientRef: { current: null },
      connectWebSocket: mockConnectWebSocket,
      disconnectWebSocket: mockDisconnectWebSocket,
      connectLobby: mockConnectLobby,
      disconnectLobby: mockDisconnectLobby,
    } as any);

    vi.mocked(useChessActions).mockReturnValue({
      game: null,
      setGame: mockSetGame,
      error: null,
      setError: mockSetError,
      gameOverResult: null,
      setGameOverResult: mockSetGameOverResult,
      isAiLoading: false,
      hintData: null,
      isHintLoading: false,
      evaluation: 0,
      selectedTheme: 'classic',
      setSelectedTheme: mockSetSelectedTheme,
      scheduleGameStateUpdate: mockScheduleGameStateUpdate,
      makeMove: mockMakeMove,
      dismissGame: mockDismissGame,
      fetchLegalMoves: mockFetchLegalMoves,
      startNewGame: mockStartNewGame,
      startAiGame: mockStartAiGame,
      fetchHint: mockFetchHint,
      resetChessState: mockBaseResetChessState,
    } as any);

    vi.mocked(useChessTimer).mockReturnValue({
      displayTime: { white: 600, black: 600 },
    } as any);
  });

  it('initializes with default orchestrator state', () => {
    // Arrange & Act
    const { result } = renderHook(() => useChess());

    // Assert
    expect(result.current.game).toBeNull();
    expect(result.current.playerColor).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isLobbyConnected).toBe(false);
    expect(result.current.displayTime).toEqual({ white: 600, black: 600 });
  });

  it('syncs player color as WHITE when authenticated user matches whiteId', () => {
    // Arrange
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('user', JSON.stringify({ id: 10 }));

    const { result } = renderHook(() => useChess());

    const actionsArgs = vi.mocked(useChessActions).mock.calls.at(-1)!;
    const syncPlayerColor = actionsArgs[3];

    // Act
    act(() => {
      syncPlayerColor({ whiteId: 10, blackId: 20 });
    });

    // Assert
    expect(result.current.playerColor).toBe('WHITE');
  });

  it('syncs player color as BLACK when authenticated user matches blackId', () => {
    // Arrange
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('user', JSON.stringify({ id: 20 }));

    const { result } = renderHook(() => useChess());

    const actionsArgs = vi.mocked(useChessActions).mock.calls.at(-1)!;
    const syncPlayerColor = actionsArgs[3];

    // Act
    act(() => {
      syncPlayerColor({ whiteId: 10, blackId: 20 });
    });

    // Assert
    expect(result.current.playerColor).toBe('BLACK');
  });

  it('converts boardRepresentation string to 8x8 matrix via getBoardMatrix', () => {
    // Arrange
    const sampleRepresentation = 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR';
    vi.mocked(useChessActions).mockReturnValue({
      game: { boardRepresentation: sampleRepresentation },
    } as any);

    const { result } = renderHook(() => useChess());

    // Act
    const matrix = result.current.getBoardMatrix();

    // Assert
    expect(matrix).toHaveLength(8);
    expect(matrix[0]).toHaveLength(8);
    expect(matrix[0]).toEqual(['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']);
    expect(matrix[7]).toEqual(['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']);
  });

  it('returns empty matrix when boardRepresentation is missing', () => {
    // Arrange
    vi.mocked(useChessActions).mockReturnValue({
      game: null,
    } as any);

    const { result } = renderHook(() => useChess());

    // Act
    const matrix = result.current.getBoardMatrix();

    // Assert
    expect(matrix).toEqual([]);
  });

  it('connects websocket with bound handlers when connectWebSocket is called', () => {
    // Arrange
    const { result } = renderHook(() => useChess());

    // Act
    act(() => {
      result.current.connectWebSocket('game-999');
    });

    // Assert
    expect(mockConnectWebSocket).toHaveBeenCalledWith(
      'game-999',
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('invokes base reset state and resets playerColor when resetChessState is called', async () => {
    // Arrange
    localStorage.setItem('user', JSON.stringify({ id: 10 }));
    const { result } = renderHook(() => useChess());

    const actionsArgs = vi.mocked(useChessActions).mock.calls.at(-1)!;
    const syncPlayerColor = actionsArgs[3];

    act(() => {
      syncPlayerColor({ whiteId: 10, blackId: 20 });
    });
    expect(result.current.playerColor).toBe('WHITE');

    // Act
    await act(async () => {
      await result.current.resetChessState();
    });

    // Assert
    expect(result.current.playerColor).toBeNull();
    expect(mockBaseResetChessState).toHaveBeenCalledTimes(1);
  });
});
