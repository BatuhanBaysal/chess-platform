import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChessTimer } from './useChessTimer';

describe('useChessTimer Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('correctly initializes and decrements timer for the active turn', () => {
    // Arrange
    const mockGame = {
      gameId: '1',
      isStarted: true,
      status: 'IN_PROGRESS',
      currentTurn: 'WHITE',
      whiteRemainingTimeMs: 60000,
      blackRemainingTimeMs: 60000,
    };

    // Act
    const { result } = renderHook(() => useChessTimer(mockGame));

    // Assert
    expect(result.current.displayTime.white).toBe(60000);
    expect(result.current.displayTime.black).toBe(60000);

    // Act
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Assert
    expect(result.current.displayTime.white).toBe(59000);
    expect(result.current.displayTime.black).toBe(60000);
  });
});
