import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGameNavigation } from './useGameNavigation';

const mockNavigate = vi.fn();
let mockPathname = '/game';

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
}));

describe('useGameNavigation Hook', () => {
  const mockResetChessState = vi.fn();
  const mockStartNewGame = vi.fn();
  const originalConfirm = window.confirm;

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    mockPathname = '/game';
    window.confirm = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  it('initializes with default gameConfig', () => {
    // Arrange & Act
    const { result } = renderHook(() => useGameNavigation(mockResetChessState, mockStartNewGame));

    // Assert
    expect(result.current.gameConfig).toEqual({
      playerName: '',
      theme: 'classic',
      timeControl: 10,
      roomId: '',
    });
  });

  it('handleBackToMenu resets state, clears roomId, and navigates to home if not already there', () => {
    // Arrange
    const { result } = renderHook(() => useGameNavigation(mockResetChessState, mockStartNewGame));

    // Act
    act(() => {
      result.current.handleBackToMenu();
    });

    // Assert
    expect(mockResetChessState).toHaveBeenCalledTimes(1);
    expect(result.current.gameConfig.roomId).toBe('');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('handleBackToMenu does not navigate if already on home path', () => {
    // Arrange
    mockPathname = '/';
    const { result } = renderHook(() => useGameNavigation(mockResetChessState, mockStartNewGame));

    // Act
    act(() => {
      result.current.handleBackToMenu();
    });

    // Assert
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handleStartMatch updates config, navigates, and starts new game with roomId', () => {
    // Arrange
    const { result } = renderHook(() => useGameNavigation(mockResetChessState, mockStartNewGame));

    // Act
    act(() => {
      result.current.handleStartMatch('modern', 3, 'room-99');
    });

    // Assert
    expect(result.current.gameConfig).toEqual({
      playerName: '',
      theme: 'modern',
      timeControl: 3,
      roomId: 'room-99',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockStartNewGame).toHaveBeenCalledWith('room-99');
  });

  it('handleStartMatch handles undefined roomId and avoids navigation when already on home path', () => {
    // Arrange
    mockPathname = '/';
    const { result } = renderHook(() => useGameNavigation(mockResetChessState, mockStartNewGame));

    // Act
    act(() => {
      result.current.handleStartMatch('classic', 10);
    });

    // Assert
    expect(result.current.gameConfig).toEqual({
      playerName: '',
      theme: 'classic',
      timeControl: 10,
      roomId: '',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockStartNewGame).toHaveBeenCalledWith(undefined);
  });

  it('handleStartMatch normalizes whitespace-only roomId to undefined and navigates when not on home path', () => {
    // Arrange
    mockPathname = '/lobby';
    const { result } = renderHook(() => useGameNavigation(mockResetChessState, mockStartNewGame));

    // Act
    act(() => {
      result.current.handleStartMatch('emerald', 30, '   ');
    });

    // Assert
    expect(result.current.gameConfig).toEqual({
      playerName: '',
      theme: 'emerald',
      timeControl: 30,
      roomId: '',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockStartNewGame).toHaveBeenCalledWith(undefined);
  });

  it('handleRestart resets state and starts new game when confirmed', () => {
    // Arrange
    window.confirm = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() => useGameNavigation(mockResetChessState, mockStartNewGame));

    // Act
    act(() => {
      result.current.handleRestart();
    });

    // Assert
    expect(window.confirm).toHaveBeenCalled();
    expect(mockResetChessState).toHaveBeenCalled();
    expect(result.current.gameConfig.roomId).toBe('');
    expect(mockStartNewGame).toHaveBeenCalledWith(undefined);
  });

  it('handleRestart does nothing when confirmation is cancelled', () => {
    // Arrange
    window.confirm = vi.fn().mockReturnValue(false);
    const { result } = renderHook(() => useGameNavigation(mockResetChessState, mockStartNewGame));

    // Act
    act(() => {
      result.current.handleRestart();
    });

    // Assert
    expect(window.confirm).toHaveBeenCalled();
    expect(mockResetChessState).not.toHaveBeenCalled();
    expect(mockStartNewGame).not.toHaveBeenCalled();
  });

  it('allows updating gameConfig directly using setGameConfig', () => {
    // Arrange
    const { result } = renderHook(() => useGameNavigation(mockResetChessState, mockStartNewGame));

    // Act
    act(() => {
      result.current.setGameConfig({
        playerName: 'grandmaster',
        theme: 'modern',
        timeControl: 3,
        roomId: 'custom-room-1',
      });
    });

    // Assert
    expect(result.current.gameConfig.playerName).toBe('grandmaster');
    expect(result.current.gameConfig.roomId).toBe('custom-room-1');
  });
});
