import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChessAudio } from './useChessAudio';

describe('useChessAudio Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with unmuted state by default', () => {
    // Arrange & Act
    const { result } = renderHook(() => useChessAudio());

    // Assert
    expect(result.current.isMuted).toBe(false);
  });

  it('toggles mute state and persists preference in localStorage', () => {
    // Arrange
    const { result } = renderHook(() => useChessAudio());

    // Act
    act(() => {
      result.current.toggleMute();
    });

    // Assert
    expect(result.current.isMuted).toBe(true);
    expect(localStorage.getItem('chess_sound_muted')).toBe('true');

    // Act
    act(() => {
      result.current.toggleMute();
    });

    // Assert
    expect(result.current.isMuted).toBe(false);
    expect(localStorage.getItem('chess_sound_muted')).toBe('false');
  });

  it('restores muted state from localStorage initialization', () => {
    // Arrange
    localStorage.setItem('chess_sound_muted', 'true');

    // Act
    const { result } = renderHook(() => useChessAudio());

    // Assert
    expect(result.current.isMuted).toBe(true);
  });

  it('safely executes audio triggers when unmuted without throwing errors', () => {
    // Arrange
    const { result } = renderHook(() => useChessAudio());

    // Act & Assert
    act(() => {
      expect(() => result.current.playMoveSound()).not.toThrow();
      expect(() => result.current.playCaptureSound()).not.toThrow();
      expect(() => result.current.playVictorySound()).not.toThrow();
      expect(() => result.current.playDefeatSound()).not.toThrow();
    });
  });
});
