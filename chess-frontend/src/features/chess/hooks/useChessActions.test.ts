import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChessActions } from './useChessActions';
import api from '@/api/axios';
import { createAiGame } from '@/api/gameService';

vi.mock('@/api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/api/gameService', () => ({
  createAiGame: vi.fn(),
}));

describe('useChessActions Hook', () => {
  const mockStompClientRef = { current: { connected: true, publish: vi.fn() } };
  const mockGameIdRef = { current: 'game-123' as string | null };
  const mockGetAuthDetails = vi.fn().mockReturnValue({ token: 'fake-token', userId: 1, headers: {} });
  const mockSyncPlayerColor = vi.fn();
  const mockConnectWebSocket = vi.fn();
  const mockDisconnectWebSocket = vi.fn();
  const mockDisconnectLobby = vi.fn();

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    mockGameIdRef.current = 'game-123';
    mockStompClientRef.current = { connected: true, publish: vi.fn() };
  });

  it('correctly initializes with default states', () => {
    // Arrange & Act
    const { result } = renderHook(() =>
      useChessActions(
        mockStompClientRef,
        mockGameIdRef,
        mockGetAuthDetails,
        mockSyncPlayerColor,
        mockConnectWebSocket,
        mockDisconnectWebSocket,
        mockDisconnectLobby
      )
    );

    // Assert
    expect(result.current.game).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.gameOverResult).toBeNull();
    expect(result.current.isAiLoading).toBe(false);
    expect(result.current.selectedTheme).toBe('default');
  });

  it('publishes a move via Stomp client when makeMove is called with valid game and connection', () => {
    // Arrange
    const { result } = renderHook(() =>
      useChessActions(
        mockStompClientRef,
        mockGameIdRef,
        mockGetAuthDetails,
        mockSyncPlayerColor,
        mockConnectWebSocket,
        mockDisconnectWebSocket,
        mockDisconnectLobby
      )
    );

    act(() => {
      result.current.setGame({ gameId: 'game-123', status: 'IN_PROGRESS' });
    });

    // Act
    act(() => {
      result.current.makeMove('game-123', 1, 1, 2, 2, 'QUEEN');
    });

    // Assert
    expect(mockStompClientRef.current.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: '/app/move',
      })
    );
  });

  it('prevents publishing move when client is disconnected or game is null', () => {
    // Arrange
    mockStompClientRef.current = { connected: false, publish: vi.fn() };
    const { result } = renderHook(() =>
      useChessActions(
        mockStompClientRef,
        mockGameIdRef,
        mockGetAuthDetails,
        mockSyncPlayerColor,
        mockConnectWebSocket,
        mockDisconnectWebSocket,
        mockDisconnectLobby
      )
    );

    // Act
    act(() => {
      result.current.makeMove('game-123', 1, 1, 2, 2);
    });

    // Assert
    expect(mockStompClientRef.current.publish).not.toHaveBeenCalled();

    // Arrange
    act(() => {
      result.current.setGame({ gameId: 'game-123' });
    });

    // Act
    act(() => {
      result.current.makeMove('game-123', 1, 1, 2, 2);
    });

    // Assert
    expect(mockStompClientRef.current.publish).not.toHaveBeenCalled();
  });

  it('schedules game state update and calculates evaluation and game over', () => {
    // Arrange
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 1;
    });

    const { result } = renderHook(() =>
      useChessActions(
        mockStompClientRef,
        mockGameIdRef,
        mockGetAuthDetails,
        mockSyncPlayerColor,
        mockConnectWebSocket,
        mockDisconnectWebSocket,
        mockDisconnectLobby
      )
    );

    const updatedState = {
      gameId: 'game-123',
      status: 'CHECKMATE',
      lastMoves: [{ evaluation: 9500 }],
    };

    // Act
    act(() => {
      result.current.scheduleGameStateUpdate(updatedState);
    });

    // Assert
    expect(result.current.game).toEqual(updatedState);
    expect(mockSyncPlayerColor).toHaveBeenCalledWith(updatedState);
    expect(result.current.evaluation).toEqual({ score: 9500, type: 'MATE' });
    expect(result.current.gameOverResult).toBe('CHECKMATE');

    rafSpy.mockRestore();
  });

  it('publishes dismiss event and cleans up state on dismissGame', () => {
    // Arrange
    const { result } = renderHook(() =>
      useChessActions(
        mockStompClientRef,
        mockGameIdRef,
        mockGetAuthDetails,
        mockSyncPlayerColor,
        mockConnectWebSocket,
        mockDisconnectWebSocket,
        mockDisconnectLobby
      )
    );

    // Act
    act(() => {
      result.current.dismissGame();
    });

    // Assert
    expect(mockStompClientRef.current.publish).toHaveBeenCalledWith({
      destination: '/app/game/dismiss',
      body: JSON.stringify({ gameId: 'game-123', userId: 1 }),
    });
    expect(result.current.gameOverResult).toBe('DISMISSED');
    expect(mockDisconnectWebSocket).toHaveBeenCalledTimes(1);
  });

  it('fetches legal moves via api.get when game is active and handles errors gracefully', async () => {
    // Arrange
    const mockMoves = [{ file: 2, rank: 3 }];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockMoves });

    const { result } = renderHook(() =>
      useChessActions(
        mockStompClientRef,
        mockGameIdRef,
        mockGetAuthDetails,
        mockSyncPlayerColor,
        mockConnectWebSocket,
        mockDisconnectWebSocket,
        mockDisconnectLobby
      )
    );

    act(() => {
      result.current.setGame({ gameId: 'game-123' });
    });

    // Act
    let moves;
    await act(async () => {
      moves = await result.current.fetchLegalMoves(1, 1);
    });

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/games/game-123/legal-moves', {
      params: { file: 1, rank: 1 },
    });
    expect(moves).toEqual(mockMoves);

    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

    // Act
    let failedMoves;
    await act(async () => {
      failedMoves = await result.current.fetchLegalMoves(1, 1);
    });

    // Assert
    expect(failedMoves).toEqual([]);
  });

  it('starts a new game creating a fresh match or reconnecting to an existing one', async () => {
    // Arrange
    const newGameData = { gameId: 'new-match-456', status: 'IN_PROGRESS' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: newGameData });

    const { result } = renderHook(() =>
      useChessActions(
        mockStompClientRef,
        mockGameIdRef,
        mockGetAuthDetails,
        mockSyncPlayerColor,
        mockConnectWebSocket,
        mockDisconnectWebSocket,
        mockDisconnectLobby
      )
    );

    // Act
    let createdGameId;
    await act(async () => {
      createdGameId = await result.current.startNewGame();
    });

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/games', null, { params: { userId: 1, whiteId: 1 } });
    expect(mockConnectWebSocket).toHaveBeenCalledWith('new-match-456');
    expect(createdGameId).toBe('new-match-456');

    // Arrange
    const existingGameData = { gameId: 'existing-789', status: 'CHECKMATE' };
    vi.mocked(api.get).mockResolvedValueOnce({ data: existingGameData });

    // Act
    let existingId;
    await act(async () => {
      existingId = await result.current.startNewGame('existing-789');
    });

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/games/existing-789', { params: { userId: 1 } });
    expect(result.current.gameOverResult).toBe('CHECKMATE');
    expect(existingId).toBe('existing-789');
  });

  it('creates and connects an AI game via startAiGame and handles errors', async () => {
    // Arrange
    const mockGame = { gameId: 'ai-game-1', status: 'IN_PROGRESS' };
    vi.mocked(createAiGame).mockResolvedValueOnce(mockGame as any);

    const { result } = renderHook(() =>
      useChessActions(
        mockStompClientRef,
        mockGameIdRef,
        mockGetAuthDetails,
        mockSyncPlayerColor,
        mockConnectWebSocket,
        mockDisconnectWebSocket,
        mockDisconnectLobby
      )
    );

    // Act
    let gameId;
    await act(async () => {
      gameId = await result.current.startAiGame(true, 3, 10);
    });

    // Assert
    expect(createAiGame).toHaveBeenCalledWith(1, true, 3, 10);
    expect(mockSyncPlayerColor).toHaveBeenCalledWith(mockGame);
    expect(mockConnectWebSocket).toHaveBeenCalledWith('ai-game-1');
    expect(gameId).toBe('ai-game-1');

    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(createAiGame).mockRejectedValueOnce(new Error('AI Service down'));

    // Act
    await act(async () => {
      await result.current.startAiGame(true, 3, 10);
    });

    // Assert
    expect(result.current.error).toBe('Failed to start AI game.');
    expect(result.current.isAiLoading).toBe(false);
  });

  it('fetches engine hint and updates evaluation score correctly', async () => {
    // Arrange
    const mockHint = { bestMoveUci: 'e2e4', evaluationScore: 9200 };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockHint });

    const { result } = renderHook(() =>
      useChessActions(
        mockStompClientRef,
        mockGameIdRef,
        mockGetAuthDetails,
        mockSyncPlayerColor,
        mockConnectWebSocket,
        mockDisconnectWebSocket,
        mockDisconnectLobby
      )
    );

    // Act
    let hint;
    await act(async () => {
      hint = await result.current.fetchHint(12);
    });

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/games/game-123/hint', {
      params: { depth: 12 },
    });
    expect(result.current.hintData).toEqual(mockHint);
    expect(result.current.evaluation).toEqual({ score: 9200, type: 'MATE' });
    expect(hint).toEqual(mockHint);
  });

  it('calls finish endpoint and clears state on resetChessState', async () => {
    // Arrange
    vi.mocked(api.post).mockResolvedValueOnce({});

    const { result } = renderHook(() =>
      useChessActions(
        mockStompClientRef,
        mockGameIdRef,
        mockGetAuthDetails,
        mockSyncPlayerColor,
        mockConnectWebSocket,
        mockDisconnectWebSocket,
        mockDisconnectLobby
      )
    );

    act(() => {
      result.current.setGameOverResult('CHECKMATE');
    });

    // Act
    await act(async () => {
      await result.current.resetChessState();
    });

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/games/game-123/finish');
    expect(mockDisconnectWebSocket).toHaveBeenCalledTimes(1);
    expect(mockDisconnectLobby).toHaveBeenCalledTimes(1);
    expect(result.current.game).toBeNull();
    expect(result.current.gameOverResult).toBeNull();
  });
});
