import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTheme } from './useTheme';

describe('useTheme Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('initializes with dark mode by default when localStorage is empty', () => {
    // Arrange & Act
    const { result } = renderHook(() => useTheme());

    // Assert
    expect(result.current.colorMode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('chess_color_mode')).toBe('dark');
  });

  it('initializes with theme from localStorage if available', () => {
    // Arrange
    localStorage.setItem('chess_color_mode', 'light');

    // Act
    const { result } = renderHook(() => useTheme());

    // Assert
    expect(result.current.colorMode).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles theme correctly between dark and light', () => {
    // Arrange
    const { result } = renderHook(() => useTheme());
    expect(result.current.colorMode).toBe('dark');

    // Act
    act(() => {
      result.current.toggleTheme();
    });

    // Assert
    expect(result.current.colorMode).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('chess_color_mode')).toBe('light');

    // Act
    act(() => {
      result.current.toggleTheme();
    });

    // Assert
    expect(result.current.colorMode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('chess_color_mode')).toBe('dark');
  });

  it('sets colorMode directly using setColorMode function', () => {
    // Arrange
    const { result } = renderHook(() => useTheme());

    // Act
    act(() => {
      result.current.setColorMode('light');
    });

    // Assert
    expect(result.current.colorMode).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('chess_color_mode')).toBe('light');
  });
});
