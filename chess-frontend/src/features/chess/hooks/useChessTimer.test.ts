import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChessTimer } from './useChessTimer';

describe('useChessTimer Hook', () => {
  beforeEach(() => {
    // Arrange
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Arrange
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

  it('decrements black timer when current turn is BLACK', () => {
    // Arrange
    const mockGame = {
      gameId: '1',
      isStarted: true,
      status: 'IN_PROGRESS',
      currentTurn: 'BLACK',
      whiteRemainingTimeMs: 60000,
      blackRemainingTimeMs: 60000,
    };

    // Act
    const { result } = renderHook(() => useChessTimer(mockGame));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Assert
    expect(result.current.displayTime.white).toBe(60000);
    expect(result.current.displayTime.black).toBe(58000);
  });

  it('does not decrement timers when game is not started', () => {
    // Arrange
    const mockGame = {
      gameId: '1',
      isStarted: false,
      status: 'WAITING',
      currentTurn: 'WHITE',
      whiteRemainingTimeMs: 60000,
      blackRemainingTimeMs: 60000,
    };

    // Act
    const { result } = renderHook(() => useChessTimer(mockGame));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Assert
    expect(result.current.displayTime.white).toBe(60000);
    expect(result.current.displayTime.black).toBe(60000);
  });

  it('stops timer interval when status is finished', () => {
    // Arrange
    const mockGame = {
      gameId: '1',
      isStarted: true,
      status: 'CHECKMATE',
      currentTurn: 'WHITE',
      whiteRemainingTimeMs: 45000,
      blackRemainingTimeMs: 45000,
    };

    // Act
    const { result } = renderHook(() => useChessTimer(mockGame));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Assert
    expect(result.current.displayTime.white).toBe(45000);
    expect(result.current.displayTime.black).toBe(45000);
  });

  it('prevents timers from dropping below zero', () => {
    // Arrange
    const mockGame = {
      gameId: '1',
      isStarted: true,
      status: 'IN_PROGRESS',
      currentTurn: 'WHITE',
      whiteRemainingTimeMs: 500,
      blackRemainingTimeMs: 10000,
    };

    // Act
    const { result } = renderHook(() => useChessTimer(mockGame));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Assert
    expect(result.current.displayTime.white).toBe(0);
    expect(result.current.displayTime.black).toBe(10000);
  });

  it('updates display time when gameId changes to another match', () => {
    // Arrange
    const initialGame = {
      gameId: '1',
      isStarted: true,
      status: 'IN_PROGRESS',
      currentTurn: 'WHITE',
      whiteRemainingTimeMs: 60000,
      blackRemainingTimeMs: 60000,
    };

    const nextGame = {
      gameId: '2',
      isStarted: true,
      status: 'IN_PROGRESS',
      currentTurn: 'WHITE',
      whiteRemainingTimeMs: 30000,
      blackRemainingTimeMs: 30000,
    };

    const { result, rerender } = renderHook((game) => useChessTimer(game), {
      initialProps: initialGame,
    });

    // Act
    rerender(nextGame);

    // Assert
    expect(result.current.displayTime.white).toBe(30000);
    expect(result.current.displayTime.black).toBe(30000);
  });
});
