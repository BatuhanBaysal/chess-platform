import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChessActions } from './useChessActions';

describe('useChessActions Hook', () => {
  const mockStompClientRef = { current: { connected: true, publish: vi.fn() } };
  const mockGameIdRef = { current: 'game-123' };
  const mockGetAuthDetails = vi.fn().mockReturnValue({ token: 'fake-token', userId: 1, headers: {} });
  const mockSyncPlayerColor = vi.fn();
  const mockConnectWebSocket = vi.fn();
  const mockDisconnectWebSocket = vi.fn();
  const mockDisconnectLobby = vi.fn();

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
  });

  it('correctly initializes with default states', () => {
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

    // Assert
    expect(result.current.game).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.gameOverResult).toBeNull();
    expect(result.current.isAiLoading).toBe(false);
  });

  it('publishes a move via Stomp client when makeMove is called', () => {
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
});
