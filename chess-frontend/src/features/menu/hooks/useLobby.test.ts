import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLobby } from './useLobby';
import api from '../../../api/axios';
import * as gameService from '../../../api/gameService';

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
    vi.clearAllMocks();
  });

  it('correctly initializes with default values and fetches rooms', async () => {
    // Arrange
    const mockRooms = [{ roomId: 'room-1', hostName: 'Player1', timeLimit: 10, theme: 'classic' }];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockRooms });

    // Act
    const { result } = renderHook(() => useLobby('user-1'));

    // Assert
    expect(result.current.rooms).toEqual([]);
    expect(result.current.isCreating).toBe(false);
    expect(result.current.waitingRoomId).toBeNull();
    expect(result.current.selectedTheme).toBe('classic');
    expect(result.current.selectedTime).toBe(10);

    // Assert
    await waitFor(() => {
      expect(result.current.rooms).toEqual(mockRooms);
    });
  });

  it('handles room cancellation correctly when waitingRoomId and userId exist', async () => {
    // Arrange
    vi.mocked(gameService.cancelLobby).mockResolvedValueOnce(undefined);
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useLobby('123'));

    // Act
    act(() => {
      result.current.setWaitingRoomId('room-abc');
    });

    // Assert
    expect(result.current.waitingRoomId).toBe('room-abc');

    // Act
    await act(async () => {
      await result.current.handleCancelDeployment();
    });

    // Assert
    expect(gameService.cancelLobby).toHaveBeenCalledWith('room-abc', 123);
    expect(result.current.waitingRoomId).toBeNull();
  });
});
