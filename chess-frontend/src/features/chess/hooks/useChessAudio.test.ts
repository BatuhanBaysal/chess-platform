import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useChessAudio } from './useChessAudio';

describe('useChessAudio Hook', () => {
  let mockOscillator: any;
  let mockGain: any;
  let mockAudioContext: any;

  beforeEach(() => {
    // Arrange
    localStorage.clear();
    vi.clearAllMocks();

    mockOscillator = {
      type: '',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      resume: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    window.AudioContext = vi.fn().mockImplementation(function (this: any) {
      return mockAudioContext;
    }) as any;
  });

  afterEach(() => {
    // Arrange
    vi.restoreAllMocks();
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

  it('syncs mute state across storage and custom event listeners', () => {
    // Arrange
    const { result } = renderHook(() => useChessAudio());
    expect(result.current.isMuted).toBe(false);

    // Act
    localStorage.setItem('chess_sound_muted', 'true');
    act(() => {
      window.dispatchEvent(new Event('chess-sound-toggle'));
    });

    // Assert
    expect(result.current.isMuted).toBe(true);

    // Act
    localStorage.setItem('chess_sound_muted', 'false');
    act(() => {
      window.dispatchEvent(new Event('storage'));
    });

    // Assert
    expect(result.current.isMuted).toBe(false);
  });

  it('resumes suspended audio context when getting audio context', () => {
    // Arrange
    mockAudioContext.state = 'suspended';
    const { result } = renderHook(() => useChessAudio());

    // Act
    act(() => {
      result.current.playMoveSound();
    });

    // Assert
    expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
  });

  it('plays all sounds with audio nodes when unmuted', () => {
    // Arrange
    const { result } = renderHook(() => useChessAudio());

    // Act
    act(() => {
      result.current.playMoveSound();
      result.current.playCaptureSound();
      result.current.playCheckSound();
      result.current.playVictorySound();
      result.current.playDefeatSound();
    });

    // Assert
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('does not trigger audio nodes when muted', () => {
    // Arrange
    localStorage.setItem('chess_sound_muted', 'true');
    const { result } = renderHook(() => useChessAudio());

    // Act
    act(() => {
      result.current.playMoveSound();
      result.current.playCaptureSound();
      result.current.playCheckSound();
      result.current.playVictorySound();
      result.current.playDefeatSound();
    });

    // Assert
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    expect(mockAudioContext.createGain).not.toHaveBeenCalled();
  });

  it('closes audio context on hook unmount', () => {
    // Arrange
    const { result, unmount } = renderHook(() => useChessAudio());

    act(() => {
      result.current.playMoveSound();
    });

    // Act
    unmount();

    // Assert
    expect(mockAudioContext.close).toHaveBeenCalledTimes(1);
  });
});
