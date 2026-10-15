import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { useLobby } from './useLobby';

describe('useLobby Hook (AAA Pattern)', () => {
  beforeAll(() => {
    const originalConsoleError = console.error;
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Lobby Sync Error')) {
        return;
      }
      originalConsoleError(...args);
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with standard default lobby parameters', () => {
    // Arrange & Act
    const { result } = renderHook(() => useLobby('user-123'));

    // Assert
    expect(result.current.selectedTime).toBe(10);
    expect(result.current.selectedTheme).toBe('classic');
    expect(result.current.waitingRoomId).toBeNull();
    expect(result.current.isCreating).toBe(false);
  });

  it('should update selected time control and board theme', () => {
    // Arrange
    const { result } = renderHook(() => useLobby('user-123'));

    // Act
    act(() => {
      result.current.setSelectedTime(3);
      result.current.setSelectedTheme('emerald');
    });

    // Assert
    expect(result.current.selectedTime).toBe(3);
    expect(result.current.selectedTheme).toBe('emerald');
  });

  it('should reset waiting room ID when deployment is cancelled', () => {
    // Arrange
    const { result } = renderHook(() => useLobby('user-123'));
    
    act(() => {
      result.current.setWaitingRoomId('ROOM-ABC-999');
    });
    expect(result.current.waitingRoomId).toBe('ROOM-ABC-999');

    // Act
    act(() => {
      result.current.handleCancelDeployment();
    });

    // Assert
    expect(result.current.waitingRoomId).toBeNull();
  });
});
