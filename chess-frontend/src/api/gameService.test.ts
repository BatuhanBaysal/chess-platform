import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './axios';
import {
  loginAsGuest,
  createLobby,
  joinRoom,
  cancelLobby,
  getActiveRooms,
  getLobbyStatus,
  createAiGame,
  getEngineHint,
  getActiveGame,
  getGameContext,
  getLegalMoves,
  getPlayerHistory,
  getGamePgn,
  finishGame,
  resignGame,
} from './gameService';

vi.mock('./axios', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('gameService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loginAsGuest calls api.post with correct url', async () => {
    // Arrange
    const mockResponse = { data: { token: 'guest-token' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await loginAsGuest();

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/auth/guest');
    expect(result).toEqual(mockResponse.data);
  });

  it('createLobby calls api.post with correct payload', async () => {
    // Arrange
    const mockResponse = { data: 'room-123' };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await createLobby(1, 'batuhan', 10, 'classic');

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/lobby/create', {
      userId: 1,
      username: 'batuhan',
      time: 10,
      theme: 'classic',
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('joinRoom calls api.post with correct payload', async () => {
    // Arrange
    vi.mocked(api.post).mockResolvedValueOnce({});

    // Act
    await joinRoom('room-123', 2, 'player2', 'modern');

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/lobby/join', {
      roomId: 'room-123',
      userId: 2,
      username: 'player2',
      theme: 'modern',
    });
  });

  it('cancelLobby calls api.delete with correct params', async () => {
    // Arrange
    vi.mocked(api.delete).mockResolvedValueOnce({});

    // Act
    await cancelLobby('room-123', 1);

    // Assert
    expect(api.delete).toHaveBeenCalledWith('/api/lobby/cancel/room-123', {
      params: { userId: 1 },
    });
  });

  it('getActiveRooms returns rooms when successful', async () => {
    // Arrange
    const mockResponse = { data: [{ roomId: 'room-1' }] };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getActiveRooms();

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/lobby/rooms');
    expect(result).toEqual(mockResponse.data);
  });

  it('getActiveRooms returns empty array on error', async () => {
    // Arrange
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network Error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const result = await getActiveRooms();

    // Assert
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });

  it('getLobbyStatus returns room response when successful', async () => {
    // Arrange
    const mockResponse = { data: { roomId: 'room-1' } };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getLobbyStatus('room-1');

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/lobby/status/room-1');
    expect(result).toEqual(mockResponse.data);
  });

  it('getLobbyStatus returns null on error', async () => {
    // Arrange
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Not Found'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const result = await getLobbyStatus('room-1');

    // Assert
    expect(result).toBeNull();
    consoleSpy.mockRestore();
  });

  it('createAiGame calls api.post with correct params', async () => {
    // Arrange
    const mockResponse = { data: { gameId: 'game-1' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await createAiGame(1, true, 3, 10);

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/games/vs-ai', null, {
      params: { userId: 1, playAsWhite: true, difficulty: 3, timeLimit: 10 },
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('getEngineHint calls api.get with correct depth param', async () => {
    // Arrange
    const mockResponse = { data: { bestMove: 'e2e4' } };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getEngineHint('game-1', 12);

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/games/game-1/hint', {
      params: { depth: 12 },
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('getActiveGame returns game response when active', async () => {
    // Arrange
    const mockResponse = { data: { gameId: 'game-1' } };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getActiveGame(1);

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/games/active/1');
    expect(result).toEqual(mockResponse.data);
  });

  it('getActiveGame returns null on error', async () => {
    // Arrange
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Not found'));

    // Act
    const result = await getActiveGame(1);

    // Assert
    expect(result).toBeNull();
  });

  it('getGameContext calls api.get with correct url', async () => {
    // Arrange
    const mockResponse = { data: { gameId: 'game-1' } };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getGameContext('game-1');

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/games/game-1');
    expect(result).toEqual(mockResponse.data);
  });

  it('getLegalMoves returns legal moves when successful', async () => {
    // Arrange
    const mockResponse = { data: [{ file: 4, rank: 3 }] };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getLegalMoves('game-1', 4, 1);

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/games/game-1/legal-moves', {
      params: { file: 4, rank: 1 },
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('getLegalMoves returns empty array on error', async () => {
    // Arrange
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const result = await getLegalMoves('game-1', 4, 1);

    // Assert
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });

  it('getPlayerHistory returns history when successful', async () => {
    // Arrange
    const mockResponse = { data: [{ gameId: 'game-1' }] };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getPlayerHistory(1);

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/games/history/1');
    expect(result).toEqual(mockResponse.data);
  });

  it('getPlayerHistory returns empty array on error', async () => {
    // Arrange
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const result = await getPlayerHistory(1);

    // Assert
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });

  it('getGamePgn calls api.get with text response type', async () => {
    // Arrange
    const mockResponse = { data: '1. e4 e5' };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getGamePgn('game-1');

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/games/game-1/export/pgn', {
      responseType: 'text',
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('finishGame calls api.post with correct url', async () => {
    // Arrange
    vi.mocked(api.post).mockResolvedValueOnce({});

    // Act
    await finishGame('game-1');

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/games/game-1/finish');
  });

  it('resignGame calls api.post with correct params', async () => {
    // Arrange
    vi.mocked(api.post).mockResolvedValueOnce({});

    // Act
    await resignGame('game-1', 1);

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/games/game-1/resign', null, {
      params: { userId: 1 },
    });
  });
});
