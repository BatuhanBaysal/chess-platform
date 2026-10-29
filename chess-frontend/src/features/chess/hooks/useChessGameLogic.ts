import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { LogEntry, MovePair } from '../types/chess.types';
import { useChessAudio } from './useChessAudio';

const INITIAL_PIECES = {
  white: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'N', 'N', 'B', 'B', 'R', 'R', 'Q', 'K'],
  black: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q', 'k']
};

const PIECE_VALUES: Record<string, number> = {
  P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100,
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 100
};

export interface ChessGameLogicParams {
  boardRepresentation: string;
  isStarted: boolean;
  gameStatus: string;
  currentTurn: string;
  moveHistory: string[];
  lastMoveMessage: string;
  orientation: 'WHITE' | 'BLACK';
  onMove: (fromFile: number, fromRank: number, toFile: number, toRank: number, promotion?: string) => void;
  fetchLegalMoves?: (file: number, rank: number) => Promise<{ file: number; rank: number }[]>;
  game?: { gameId?: string; lastMoves?: { moveQuality?: string }[] };
}

export type ChessGameLogicPositionalArgs = [
  boardRepresentation: string,
  isStarted: boolean,
  gameStatus: string,
  currentTurn: string,
  moveHistory: string[],
  lastMoveMessage: string,
  orientation: 'WHITE' | 'BLACK',
  onMove: (fromFile: number, fromRank: number, toFile: number, toRank: number, promotion?: string) => void,
  fetchLegalMoves?: (file: number, rank: number) => Promise<{ file: number; rank: number }[]>,
  game?: { gameId?: string; lastMoves?: { moveQuality?: string }[] }
];

const createInitialLog = (): LogEntry => ({
  text: 'Game started. White to move.',
  turn: 'WHITE',
  time: new Date().toLocaleTimeString('en-GB', { hour12: false })
});

const loadSavedLogs = (gameId?: string): LogEntry[] | null => {
  if (!gameId) return null;
  try {
    const savedData = sessionStorage.getItem(`chess_game_logs_${gameId}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const loadedLogs = Array.isArray(parsed) ? parsed : (parsed.logs || []);
      if (loadedLogs.length > 0) return loadedLogs;
    }
  } catch {
    
  }
  return null;
};

const isPieceOwnedByPlayer = (piece: string, orientation: 'WHITE' | 'BLACK'): boolean => {
  if (!piece || piece === '.') return false;
  return orientation === 'WHITE' ? piece === piece.toUpperCase() : piece === piece.toLowerCase();
};

const resolveWinnerReason = (upperStatus: string, isWhite: boolean): string => {
  if (upperStatus.includes('WON')) {
    const winnerIsWhite = upperStatus.includes('WHITE');
    return isWhite === winnerIsWhite ? 'Victory!' : 'Defeat!';
  }
  if (upperStatus.includes('LOST')) {
    const loserIsWhite = upperStatus.includes('WHITE');
    return isWhite === loserIsWhite ? 'Defeat!' : 'Victory!';
  }
  return 'Defeat!';
};

const resolveTurnLabel = (isError: boolean, currentTurn: string): string => {
  if (isError) return currentTurn.toUpperCase();
  return currentTurn.toUpperCase() === 'WHITE' ? 'BLACK' : 'WHITE';
};

export function useChessGameLogic(...args: ChessGameLogicPositionalArgs): ReturnType<typeof useChessGameLogicImpl>;
export function useChessGameLogic(params: ChessGameLogicParams): ReturnType<typeof useChessGameLogicImpl>;
export function useChessGameLogic(
  firstArg: string | ChessGameLogicParams,
  ...restArgs: unknown[]
) {
  let params: ChessGameLogicParams;

  if (typeof firstArg === 'object' && firstArg !== null && 'boardRepresentation' in firstArg) {
    params = firstArg;
  } else {
    params = {
      boardRepresentation: firstArg,
      isStarted: restArgs[0] as boolean,
      gameStatus: restArgs[1] as string,
      currentTurn: restArgs[2] as string,
      moveHistory: restArgs[3] as string[],
      lastMoveMessage: restArgs[4] as string,
      orientation: restArgs[5] as 'WHITE' | 'BLACK',
      onMove: restArgs[6] as ChessGameLogicParams['onMove'],
      fetchLegalMoves: restArgs[7] as ChessGameLogicParams['fetchLegalMoves'],
      game: restArgs[8] as ChessGameLogicParams['game']
    };
  }

  return useChessGameLogicImpl(params);
}

function useChessGameLogicImpl({
  boardRepresentation,
  isStarted,
  gameStatus,
  currentTurn,
  moveHistory,
  lastMoveMessage,
  orientation,
  onMove,
  fetchLegalMoves,
  game
}: Readonly<ChessGameLogicParams>) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: number; to: number } | null>(null);
  const [legalMoves, setLegalMoves] = useState<{ file: number; rank: number }[]>([]);

  const {
    playMoveSound,
    playCaptureSound,
    playCheckSound,
    playVictorySound,
    playDefeatSound,
  } = useChessAudio();

  const currentGameId = game?.gameId;
  const storageKey = currentGameId ? `chess_game_logs_${currentGameId}` : `chess_game_logs_active`;

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      if (storageKey) {
        const savedData = sessionStorage.getItem(storageKey);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          if (parsed.gameId === currentGameId && Array.isArray(parsed.logs) && parsed.logs.length > 0) {
            return parsed.logs;
          }
        }
      }
    } catch {
      
    }
    return isStarted ? [createInitialLog()] : [];
  });

  const [activePiece, setActivePiece] = useState<{ char: string; index: number } | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [moveQualities, setMoveQualities] = useState<Record<number, string>>({});

  const lastProcessedMessage = useRef<string | null>(null);
  const prevGameIdRef = useRef<string | undefined>(currentGameId);
  const prevCheckRef = useRef<boolean>(false);
  const prevGameOverRef = useRef<boolean>(false);

  useEffect(() => {
    if (prevGameIdRef.current !== currentGameId) {
      prevGameIdRef.current = currentGameId;
      setSelectedSquare(null);
      setPromotionPending(null);
      setLegalMoves([]);
      setMoveQualities({});
      lastProcessedMessage.current = null;
      prevCheckRef.current = false;
      prevGameOverRef.current = false;

      const loadedLogs = loadSavedLogs(currentGameId);
      if (loadedLogs) {
        setLogs(loadedLogs);
        return;
      }

      try {
        sessionStorage.removeItem('chess_game_logs_active');
      } catch {
        
      }

      setLogs([createInitialLog()]);
    }
  }, [currentGameId]);

  useEffect(() => {
    try {
      if (logs.length > 0 && storageKey) {
        sessionStorage.setItem(storageKey, JSON.stringify({
          gameId: currentGameId,
          logs: logs
        }));
      }
    } catch (e) {
      console.error("Failed to save logs", e);
    }
  }, [logs, storageKey, currentGameId]);

  const squares = useMemo(() => {
    if (!boardRepresentation) return new Array(64).fill('.');
    return boardRepresentation.split('|')[0].slice(0, 64).split('');
  }, [boardRepresentation]);

  const upperStatus = (gameStatus || "").toUpperCase();
  const isGameOver = isStarted && [
    'WON', 'LOST', 'DRAW', 'CHECKMATE', 'STALEMATE', 'RESIGNED',
    'TIMEOUT', 'CLOSING', 'ABANDONED', 'FINISHED', 'DISMISSED'
  ].some(s => upperStatus.includes(s));

  const showSyncing = (!isStarted && !isGameOver) || (upperStatus.includes('TIMEOUT') && !showGameOverModal);
  const isCheck = upperStatus.includes('CHECK') && !isGameOver;
  const isMyTurn = currentTurn?.toUpperCase() === orientation.toUpperCase();

  const getActualIndex = useCallback(
    (visualIndex: number) => orientation === 'WHITE' ? visualIndex : 63 - visualIndex,
    [orientation]
  );
  const getCoordsFromIndex = (index: number) => ({ file: index % 8, rank: 7 - Math.floor(index / 8) });

  useEffect(() => {
    if (moveHistory && moveHistory.length > 0 && game?.lastMoves?.[0]?.moveQuality) {
      const latestMoveIndex = moveHistory.length - 1;
      setMoveQualities(prev => ({ ...prev, [latestMoveIndex]: game.lastMoves![0].moveQuality! }));
    }
  }, [moveHistory, game?.lastMoves]);

  const pairedMoves: MovePair[] = useMemo(() => {
    const pairs = [];
    const history = moveHistory || [];
    for (let i = 0; i < history.length; i += 2) {
      pairs.push({
        index: Math.floor(i / 2) + 1,
        white: history[i],
        whiteIndex: i,
        whiteQuality: moveQualities[i],
        black: history[i + 1] || null,
        blackIndex: i + 1,
        blackQuality: moveQualities[i + 1]
      });
    }
    return pairs.reverse();
  }, [moveHistory, moveQualities]);

  useEffect(() => {
    if (isStarted && logs.length === 0) {
      setLogs([createInitialLog()]);
    }
  }, [isStarted, logs.length]);

  const getEndGameReason = useCallback(() => {
    if (upperStatus.includes('DISMISSED') || upperStatus.includes('ABANDONED')) {
      return "Game Dismissed / Abandoned";
    }
    if (upperStatus.includes('TIMEOUT')) {
      const loser = upperStatus.split('_')[1];
      return loser === orientation.toUpperCase() ? "You timed out!" : "Opponent timed out!";
    }
    if (upperStatus.includes('DRAW') || upperStatus.includes('STALEMATE')) {
      return "Draw!";
    }

    const isWhite = orientation === 'WHITE';
    if (upperStatus.includes('WON') || upperStatus.includes('LOST')) {
      return resolveWinnerReason(upperStatus, isWhite);
    }
    if (upperStatus.includes('CHECKMATE')) {
      const loser = upperStatus.split('_')[1];
      if (loser) {
        return loser === orientation.toUpperCase() ? "Defeat!" : "Victory!";
      }
      return "Defeat!";
    }
    return "Game Over";
  }, [upperStatus, orientation]);

  useEffect(() => {
    if (isCheck && !prevCheckRef.current) {
      playCheckSound();
    }
    prevCheckRef.current = isCheck;
  }, [isCheck, playCheckSound]);

  useEffect(() => {
    if (isGameOver && !prevGameOverRef.current) {
      setShowGameOverModal(true);
      const reason = getEndGameReason();
      if (reason.includes("Victory")) {
        playVictorySound();
      } else if (reason.includes("Defeat") || reason.includes("timed out")) {
        playDefeatSound();
      }
    }
    prevGameOverRef.current = isGameOver;
  }, [isGameOver, getEndGameReason, playVictorySound, playDefeatSound]);

  useEffect(() => {
    if (lastMoveMessage && lastMoveMessage !== lastProcessedMessage.current) {
      const isError = lastMoveMessage.includes("Illegal") || lastMoveMessage.includes("not your turn");

      if (!isError && lastProcessedMessage.current !== null) {
        const isCapture = lastMoveMessage.toLowerCase().includes("capture") || lastMoveMessage.includes("takes");
        if (isCapture) {
          playCaptureSound();
        } else {
          playMoveSound();
        }
      }

      setLogs(prev => {
        if (prev.length > 0 && prev[0].text === lastMoveMessage) {
          return prev;
        }

        const hasStartLog = prev.some(l => l.text.includes("Game started"));
        const baseLogs = hasStartLog ? prev : [...prev, createInitialLog()];

        return [{
          text: lastMoveMessage,
          turn: resolveTurnLabel(isError, currentTurn),
          time: new Date().toLocaleTimeString('en-GB', { hour12: false })
        }, ...baseLogs].slice(0, 50);
      });

      lastProcessedMessage.current = lastMoveMessage;
    }
  }, [lastMoveMessage, currentTurn]);

  const { whiteCaptured, blackCaptured } = useMemo(() => {
    const currentWhite = squares.filter(s => s !== '.' && s === s.toUpperCase());
    const currentBlack = squares.filter(s => s !== '.' && s === s.toLowerCase());
    const tempWhite = [...INITIAL_PIECES.white];
    const tempBlack = [...INITIAL_PIECES.black];
    
    currentWhite.forEach(p => { const idx = tempWhite.indexOf(p); if (idx > -1) tempWhite.splice(idx, 1); });
    currentBlack.forEach(p => { const idx = tempBlack.indexOf(p); if (idx > -1) tempBlack.splice(idx, 1); });
    
    tempBlack.sort((a, b) => PIECE_VALUES[a.toUpperCase()] - PIECE_VALUES[b.toUpperCase()]);
    tempWhite.sort((a, b) => PIECE_VALUES[a.toUpperCase()] - PIECE_VALUES[b.toUpperCase()]);

    return {
      whiteCaptured: tempBlack,
      blackCaptured: tempWhite
    };
  }, [squares]);

  const executeMove = (fromIndex: number, toIndex: number) => {
    if (isGameOver) return;
    const from = getCoordsFromIndex(fromIndex);
    const to = getCoordsFromIndex(toIndex);
    const movingPiece = squares[fromIndex];
    const isPawn = movingPiece.toLowerCase() === 'p';
    const isPromotion = isPawn && (to.rank === 7 || to.rank === 0);

    setSelectedSquare(null);
    setLegalMoves([]);

    if (isPromotion) {
      setPromotionPending({ from: fromIndex, to: toIndex });
    } else {
      onMove(from.file, from.rank, to.file, to.rank);
    }
  };

  const handleSquareClick = async (actualIndex: number) => {
    if (isGameOver || !isMyTurn || !isStarted) return;
    const { file, rank } = getCoordsFromIndex(actualIndex);
    const pieceAtTarget = squares[actualIndex];
    const targetIsOwnPiece = isPieceOwnedByPlayer(pieceAtTarget, orientation);

    if (selectedSquare === null) {
      if (targetIsOwnPiece) {
        setSelectedSquare(actualIndex);
        if (fetchLegalMoves) {
          const moves = await fetchLegalMoves(file, rank);
          setLegalMoves(moves);
        }
      }
      return;
    }

    const isLegal = legalMoves.some(m => m.file === file && m.rank === rank);
    if (isLegal) {
      executeMove(selectedSquare, actualIndex);
      return;
    }

    if (targetIsOwnPiece) {
      setSelectedSquare(actualIndex);
      if (fetchLegalMoves) {
        const moves = await fetchLegalMoves(file, rank);
        setLegalMoves(moves);
      }
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (isGameOver || !isMyTurn || !isStarted) return;
    const visualIndex = Number.parseInt((event.active.id as string).split('-')[1], 10);
    const actualIndex = getActualIndex(visualIndex);
    setActivePiece({ char: event.active.data.current?.char, index: actualIndex });
    void handleSquareClick(actualIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePiece(null);
    const { active, over } = event;
    if (!over || isGameOver || !isMyTurn || !isStarted) return;
    const visualFrom = Number.parseInt((active.id as string).split('-')[1], 10);
    const visualTo = Number.parseInt((over.id as string).split('-')[1], 10);
    const fromIndex = getActualIndex(visualFrom);
    const toIndex = getActualIndex(visualTo);
    if (fromIndex !== toIndex) {
      const to = getCoordsFromIndex(toIndex);
      const isLegal = legalMoves.some(m => m.file === to.file && m.rank === to.rank);
      if (isLegal) {
        executeMove(fromIndex, toIndex);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    selectedSquare, promotionPending, setPromotionPending, legalMoves, logs, activePiece,
    showGameOverModal, setShowGameOverModal, squares, isGameOver, showSyncing, isCheck, isMyTurn,
    whiteCaptured, blackCaptured, pairedMoves, getEndGameReason,
    getActualIndex, getCoordsFromIndex, handleSquareClick, handleDragStart, handleDragEnd,
    formatTime
  };
}

export default useChessGameLogic;
