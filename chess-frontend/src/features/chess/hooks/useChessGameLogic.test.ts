import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useChessGameLogic } from './useChessGameLogic';

describe('useChessGameLogic Hook', () => {
  const mockOnMove = vi.fn();

  it('correctly initializes squares from board representation', () => {
    // Arrange
    const initialBoard = 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR';
    
    // Act
    const { result } = renderHook(() =>
      useChessGameLogic(
        initialBoard,
        true,
        'IN_PROGRESS',
        'WHITE',
        [],
        '',
        'WHITE',
        mockOnMove
      )
    );

    // Assert
    expect(result.current.squares.length).toBe(64);
    expect(result.current.isGameOver).toBe(false);
    expect(result.current.isMyTurn).toBe(true);
  });

  it('correctly detects game over status', () => {
    // Arrange
    const initialBoard = 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR';
    
    // Act
    const { result } = renderHook(() =>
      useChessGameLogic(
        initialBoard,
        true,
        'CHECKMATE_WHITE',
        'BLACK',
        [],
        '',
        'WHITE',
        mockOnMove
      )
    );

    // Assert
    expect(result.current.isGameOver).toBe(true);
  });
});
