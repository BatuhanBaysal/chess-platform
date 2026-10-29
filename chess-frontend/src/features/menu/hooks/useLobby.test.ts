import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLobby } from './useLobby';
import api from '../../../api/axios';
import { cancelLobby } from '../../../api/gameService';

vi.mock('../../../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../../../api/gameService', () => ({
  cancelLobby: vi.fn(),
}));

describe('useLobby Hook', () => {
  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    vi.mocked(cancelLobby).mockResolvedValue({} as any);
  });

  afterEach(() => {
    // Arrange
    vi.useRealTimers();
  });

  it('should initialize with standard default lobby parameters', async () => {
    // Arrange & Act
    const { result } = renderHook(() => useLobby('123'));

    await act(async () => {
      await Promise.resolve();
    });

    // Assert
    expect(result.current.selectedTime).toBe(10);
    expect(result.current.selectedTheme).toBe('classic');
    expect(result.current.waitingRoomId).toBeNull();
    expect(result.current.isCreating).toBe(false);
    expect(result.current.rooms).toEqual([]);
    expect(api.get).toHaveBeenCalledWith('/api/lobby/rooms');
  });

  it('should update selected time control and board theme', async () => {
    // Arrange
    const { result } = renderHook(() => useLobby('123'));

    await act(async () => {
      await Promise.resolve();
    });

    // Act
    act(() => {
      result.current.setSelectedTime(3);
      result.current.setSelectedTheme('emerald');
    });

    // Assert
    expect(result.current.selectedTime).toBe(3);
    expect(result.current.selectedTheme).toBe('emerald');
  });

  it('should periodic fetch rooms via interval timer', async () => {
    // Arrange
    const mockRooms = [
      { roomId: 'room-1', hostName: 'magnus', timeLimit: 10, theme: 'classic' as const },
    ];
    vi.mocked(api.get).mockResolvedValue({ data: mockRooms });

    const { result } = renderHook(() => useLobby('123'));

    // Act
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Assert
    expect(api.get).toHaveBeenCalledTimes(2);
    expect(result.current.rooms).toEqual(mockRooms);
  });

  it('should reset waiting room ID and call cancelLobby when deployment is cancelled', async () => {
    // Arrange
    const { result } = renderHook(() => useLobby('123'));

    act(() => {
      result.current.setWaitingRoomId('ROOM-ABC-999');
    });
    expect(result.current.waitingRoomId).toBe('ROOM-ABC-999');

    // Act
    await act(async () => {
      await result.current.handleCancelDeployment();
    });

    // Assert
    expect(result.current.waitingRoomId).toBeNull();
    expect(cancelLobby).toHaveBeenCalledWith('ROOM-ABC-999', 123);
  });

  it('should handle cancel lobby api errors gracefully', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(cancelLobby).mockRejectedValueOnce(new Error('Cancel failed'));

    const { result } = renderHook(() => useLobby('123'));

    act(() => {
      result.current.setWaitingRoomId('ROOM-ERR-500');
    });

    // Act
    await act(async () => {
      await result.current.handleCancelDeployment();
    });

    // Assert
    expect(result.current.waitingRoomId).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Cancel lobby error:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
