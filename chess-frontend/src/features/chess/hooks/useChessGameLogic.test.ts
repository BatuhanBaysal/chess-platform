import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChessGameLogic, type ChessGameLogicParams } from './useChessGameLogic';

const mockPlayMoveSound = vi.fn();
const mockPlayCaptureSound = vi.fn();
const mockPlayCheckSound = vi.fn();
const mockPlayVictorySound = vi.fn();
const mockPlayDefeatSound = vi.fn();

vi.mock('./useChessAudio', () => ({
  useChessAudio: () => ({
    isMuted: false,
    toggleMute: vi.fn(),
    playMoveSound: mockPlayMoveSound,
    playCaptureSound: mockPlayCaptureSound,
    playCheckSound: mockPlayCheckSound,
    playVictorySound: mockPlayVictorySound,
    playDefeatSound: mockPlayDefeatSound,
  }),
}));

describe('useChessGameLogic Hook', () => {
  const mockOnMove = vi.fn();
  const mockFetchLegalMoves = vi.fn();
  const standardBoard = 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR';

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('correctly initializes squares from board representation', () => {
    const { result } = renderHook(() =>
      useChessGameLogic(
        standardBoard,
        true,
        'IN_PROGRESS',
        'WHITE',
        [],
        '',
        'WHITE',
        mockOnMove
      )
    );

    expect(result.current.squares).toHaveLength(64);
    expect(result.current.isGameOver).toBe(false);
    expect(result.current.isMyTurn).toBe(true);
  });

  it('correctly detects game over status', () => {
    const { result } = renderHook(() =>
      useChessGameLogic(
        standardBoard,
        true,
        'CHECKMATE_WHITE',
        'BLACK',
        [],
        '',
        'WHITE',
        mockOnMove
      )
    );

    expect(result.current.isGameOver).toBe(true);
    expect(result.current.showGameOverModal).toBe(true);
    expect(mockPlayDefeatSound).toHaveBeenCalledTimes(1);
  });

  it('selects owned piece and loads legal moves on square click', async () => {
    const legalTargets = [{ file: 4, rank: 3 }, { file: 4, rank: 2 }];
    mockFetchLegalMoves.mockResolvedValueOnce(legalTargets);

    const { result } = renderHook(() =>
      useChessGameLogic({
        boardRepresentation: standardBoard,
        isStarted: true,
        gameStatus: 'IN_PROGRESS',
        currentTurn: 'WHITE',
        moveHistory: [],
        lastMoveMessage: '',
        orientation: 'WHITE',
        onMove: mockOnMove,
        fetchLegalMoves: mockFetchLegalMoves,
      })
    );

    await act(async () => {
      await result.current.handleSquareClick(52);
    });

    expect(result.current.selectedSquare).toBe(52);
    expect(mockFetchLegalMoves).toHaveBeenCalledWith(4, 1);
    expect(result.current.legalMoves).toEqual(legalTargets);
  });

  it('executes regular move when clicking on a legal target square', async () => {
    mockFetchLegalMoves.mockResolvedValueOnce([{ file: 4, rank: 3 }]);

    const { result } = renderHook(() =>
      useChessGameLogic({
        boardRepresentation: standardBoard,
        isStarted: true,
        gameStatus: 'IN_PROGRESS',
        currentTurn: 'WHITE',
        moveHistory: [],
        lastMoveMessage: '',
        orientation: 'WHITE',
        onMove: mockOnMove,
        fetchLegalMoves: mockFetchLegalMoves,
      })
    );

    await act(async () => {
      await result.current.handleSquareClick(52);
    });

    await act(async () => {
      await result.current.handleSquareClick(36);
    });

    expect(mockOnMove).toHaveBeenCalledWith(4, 1, 4, 3);
    expect(result.current.selectedSquare).toBeNull();
    expect(result.current.legalMoves).toEqual([]);
  });

  it('triggers promotion pending state when pawn reaches target rank', async () => {
    const promotionBoard = 'rnbqkbnrPppppppp................................PPPPPPPPRNBQKBNR';
    mockFetchLegalMoves.mockResolvedValueOnce([{ file: 0, rank: 7 }]);

    const { result } = renderHook(() =>
      useChessGameLogic({
        boardRepresentation: promotionBoard,
        isStarted: true,
        gameStatus: 'IN_PROGRESS',
        currentTurn: 'WHITE',
        moveHistory: [],
        lastMoveMessage: '',
        orientation: 'WHITE',
        onMove: mockOnMove,
        fetchLegalMoves: mockFetchLegalMoves,
      })
    );

    await act(async () => {
      await result.current.handleSquareClick(8);
    });

    await act(async () => {
      await result.current.handleSquareClick(0);
    });

    expect(result.current.promotionPending).toEqual({ from: 8, to: 0 });
    expect(mockOnMove).not.toHaveBeenCalled();
  });

  it('executes move on valid drag and drop sequence', async () => {
    mockFetchLegalMoves.mockResolvedValue([{ file: 4, rank: 3 }]);

    const { result } = renderHook(() =>
      useChessGameLogic({
        boardRepresentation: standardBoard,
        isStarted: true,
        gameStatus: 'IN_PROGRESS',
        currentTurn: 'WHITE',
        moveHistory: [],
        lastMoveMessage: '',
        orientation: 'WHITE',
        onMove: mockOnMove,
        fetchLegalMoves: mockFetchLegalMoves,
      })
    );

    await act(async () => {
      result.current.handleDragStart({
        active: { id: 'square-52', data: { current: { char: 'P' } } },
      } as any);
    });

    expect(result.current.activePiece).toEqual({ char: 'P', index: 52 });

    await act(async () => {
      result.current.handleDragEnd({
        active: { id: 'square-52' },
        over: { id: 'square-36' },
      } as any);
    });

    expect(result.current.activePiece).toBeNull();
  });

  it('plays capture sound and adds log when lastMoveMessage indicates capture', () => {
    const initialProps: ChessGameLogicParams = {
      boardRepresentation: standardBoard,
      isStarted: true,
      gameStatus: 'IN_PROGRESS',
      currentTurn: 'WHITE',
      moveHistory: [],
      lastMoveMessage: 'e4',
      orientation: 'WHITE',
      onMove: mockOnMove,
    };

    const { result, rerender } = renderHook(
      (props: ChessGameLogicParams) => useChessGameLogic(props),
      { initialProps }
    );

    rerender({
      boardRepresentation: standardBoard,
      isStarted: true,
      gameStatus: 'IN_PROGRESS',
      currentTurn: 'BLACK',
      moveHistory: ['e4', 'exd5'],
      lastMoveMessage: 'exd5 capture',
      orientation: 'WHITE',
      onMove: mockOnMove,
    });

    expect(mockPlayCaptureSound).toHaveBeenCalledTimes(1);
    expect(result.current.logs[0].text).toBe('exd5 capture');
  });

  it('calculates captured pieces correctly from current board representation', () => {
    const boardMissingPawns = 'rnbqkbnr.ppppppp................................PPPPPPP.RNBQKBNR';

    const { result } = renderHook(() =>
      useChessGameLogic({
        boardRepresentation: boardMissingPawns,
        isStarted: true,
        gameStatus: 'IN_PROGRESS',
        currentTurn: 'WHITE',
        moveHistory: [],
        lastMoveMessage: '',
        orientation: 'WHITE',
        onMove: mockOnMove,
      })
    );

    expect(result.current.whiteCaptured).toContain('p');
    expect(result.current.blackCaptured).toContain('P');
  });

  it('formats remaining timer milliseconds accurately', () => {
    const { result } = renderHook(() =>
      useChessGameLogic(
        standardBoard,
        true,
        'IN_PROGRESS',
        'WHITE',
        [],
        '',
        'WHITE',
        mockOnMove
      )
    );

    const formatted = result.current.formatTime(125000);
    expect(formatted).toBe('2:05');
  });

  it('handles orientation flip for black and paired moves', () => {
    const { result } = renderHook(() =>
      useChessGameLogic({
        boardRepresentation: standardBoard,
        isStarted: true,
        gameStatus: 'IN_PROGRESS',
        currentTurn: 'BLACK',
        moveHistory: ['e4', 'e5'],
        lastMoveMessage: 'e5',
        orientation: 'BLACK',
        onMove: mockOnMove,
      })
    );

    expect(result.current.getActualIndex(0)).toBe(63);
    expect(result.current.isMyTurn).toBe(true);
    expect(result.current.pairedMoves).toHaveLength(1);
  });
});
