import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChessSocket } from './useChessSocket';

const mockPublish = vi.fn();
const mockSubscribe = vi.fn();
const mockActivate = vi.fn();
const mockDeactivate = vi.fn();

let clientConfig: any = null;

vi.mock('@stomp/stompjs', () => {
  return {
    Client: vi.fn().mockImplementation(function (this: any, config: any) {
      clientConfig = config;
      this.activate = mockActivate;
      this.deactivate = mockDeactivate;
      this.publish = mockPublish;
      this.subscribe = mockSubscribe;
      this.connected = true;
    }),
  };
});

vi.mock('sockjs-client', () => {
  return {
    default: vi.fn().mockImplementation(function (this: any) {}),
  };
});

describe('useChessSocket Hook', () => {
  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    vi.useFakeTimers();
    clientConfig = null;
  });

  afterEach(() => {
    // Arrange
    vi.useRealTimers();
  });

  it('initializes with disconnected state', () => {
    // Arrange & Act
    const { result } = renderHook(() => useChessSocket());

    // Assert
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isLobbyConnected).toBe(false);
    expect(result.current.stompClientRef.current).toBeNull();
  });

  it('connects to game websocket and activates STOMP client', () => {
    // Arrange
    const { result } = renderHook(() => useChessSocket());
    const mockAuthDetails = () => ({
      token: 'jwt-token',
      userId: 1,
      headers: { Authorization: 'Bearer jwt-token' },
    });

    // Act
    act(() => {
      result.current.connectWebSocket(
        'game-123',
        mockAuthDetails,
        vi.fn(),
        vi.fn(),
        vi.fn(),
        vi.fn()
      );
    });

    // Assert
    expect(mockActivate).toHaveBeenCalledTimes(1);
    expect(clientConfig.connectHeaders).toEqual({ Authorization: 'Bearer jwt-token' });
  });

  it('handles game connect event, ready dispatch, and topic subscription', () => {
    // Arrange
    const { result } = renderHook(() => useChessSocket());
    const onGameStateUpdate = vi.fn();
    const onGameOver = vi.fn();
    const mockAuthDetails = () => ({
      token: 'jwt-token',
      userId: 1,
      headers: { Authorization: 'Bearer jwt-token' },
    });

    act(() => {
      result.current.connectWebSocket(
        'game-123',
        mockAuthDetails,
        onGameStateUpdate,
        onGameOver,
        vi.fn(),
        vi.fn()
      );
    });

    // Act
    act(() => {
      clientConfig.onConnect();
    });

    // Assert
    expect(result.current.isConnected).toBe(true);
    expect(mockPublish).toHaveBeenCalledWith({
      destination: '/app/ready',
      body: JSON.stringify({ gameId: 'game-123', userId: 1 }),
      headers: { Authorization: 'Bearer jwt-token' },
    });
    expect(mockSubscribe).toHaveBeenCalledWith(
      '/topic/game/game-123',
      expect.any(Function)
    );
    expect(mockSubscribe).toHaveBeenCalledWith(
      '/user/queue/errors',
      expect.any(Function)
    );
  });

  it('updates game state when message is received on game topic', () => {
    // Arrange
    const { result } = renderHook(() => useChessSocket());
    const onGameStateUpdate = vi.fn();
    const onGameOver = vi.fn();

    act(() => {
      result.current.connectWebSocket(
        'game-123',
        () => ({ token: null, userId: 1, headers: {} }),
        onGameStateUpdate,
        onGameOver,
        vi.fn(),
        vi.fn()
      );
    });

    act(() => {
      clientConfig.onConnect();
    });

    const gameTopicSubscription = mockSubscribe.mock.calls.find(
      (call) => call[0] === '/topic/game/game-123'
    )!;
    const messageHandler = gameTopicSubscription[1];

    // Act
    act(() => {
      messageHandler({ body: JSON.stringify({ type: 'MOVE_MADE', fen: 'some-fen' }) });
    });

    // Assert
    expect(onGameStateUpdate).toHaveBeenCalledWith({ type: 'MOVE_MADE', fen: 'some-fen' });

    // Act
    act(() => {
      messageHandler({ body: JSON.stringify({ type: 'GAME_OVER', result: 'WHITE_WINS' }) });
    });

    // Assert
    expect(onGameOver).toHaveBeenCalledWith('WHITE_WINS');
  });

  it('triggers onDismissed when DISMISSED error arrives in error queue', () => {
    // Arrange
    const { result } = renderHook(() => useChessSocket());
    const onDismissed = vi.fn();

    act(() => {
      result.current.connectWebSocket(
        'game-123',
        () => ({ token: null, userId: 1, headers: {} }),
        vi.fn(),
        vi.fn(),
        onDismissed,
        vi.fn()
      );
    });

    act(() => {
      clientConfig.onConnect();
    });

    const errorQueueSubscription = mockSubscribe.mock.calls.find(
      (call) => call[0] === '/user/queue/errors'
    )!;
    const messageHandler = errorQueueSubscription[1];

    // Act
    act(() => {
      messageHandler({ body: JSON.stringify({ type: 'DISMISSED' }) });
    });

    // Assert
    expect(onDismissed).toHaveBeenCalledTimes(1);
    expect(mockDeactivate).toHaveBeenCalledTimes(1);
  });

  it('sends periodic heartbeat when connected', () => {
    // Arrange
    const { result } = renderHook(() => useChessSocket());

    act(() => {
      result.current.connectWebSocket(
        'game-123',
        () => ({ token: null, userId: 1, headers: {} }),
        vi.fn(),
        vi.fn(),
        vi.fn(),
        vi.fn()
      );
    });

    act(() => {
      clientConfig.onConnect();
    });

    // Act
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Assert
    expect(mockPublish).toHaveBeenCalledWith({
      destination: '/app/game/heartbeat',
      body: JSON.stringify({ gameId: 'game-123', userId: 1 }),
      headers: {},
    });
  });

  it('disconnectWebSocket deactivates client and resets state', () => {
    // Arrange
    const { result } = renderHook(() => useChessSocket());

    act(() => {
      result.current.connectWebSocket(
        'game-123',
        () => ({ token: null, userId: 1, headers: {} }),
        vi.fn(),
        vi.fn(),
        vi.fn(),
        vi.fn()
      );
    });

    act(() => {
      clientConfig.onConnect();
    });

    // Act
    act(() => {
      result.current.disconnectWebSocket();
    });

    // Assert
    expect(mockDeactivate).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
  });

  it('connectLobby activates client and handles match found', () => {
    // Arrange
    const { result } = renderHook(() => useChessSocket());
    const onMatchFound = vi.fn();

    act(() => {
      result.current.connectLobby(
        'room-456',
        () => ({ token: 'jwt-token' }),
        onMatchFound
      );
    });

    // Act
    act(() => {
      clientConfig.onConnect();
    });

    const lobbyTopicCall = mockSubscribe.mock.calls.find(
      (call) => call[0] === '/topic/lobby/room-456'
    )!;
    const messageHandler = lobbyTopicCall[1];

    // Act
    act(() => {
      messageHandler({ body: JSON.stringify({ status: 'START_GAME', gameId: 'game-created' }) });
    });

    // Assert
    expect(result.current.isLobbyConnected).toBe(true);
    expect(onMatchFound).toHaveBeenCalledWith('game-created');

    // Act
    act(() => {
      result.current.disconnectLobby();
    });

    // Assert
    expect(result.current.isLobbyConnected).toBe(false);
  });
});
