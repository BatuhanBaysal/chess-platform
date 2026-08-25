import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { LogEntry, MovePair } from '../types/chess.types';

const INITIAL_PIECES = {
  white: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'N', 'N', 'B', 'B', 'R', 'R', 'Q', 'K'],
  black: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q', 'k']
};

const PIECE_VALUES: { [key: string]: number } = {
  'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100,
  'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100,
};

export const useChessGameLogic = (
  boardRepresentation: string,
  isStarted: boolean,
  gameStatus: string,
  currentTurn: string,
  moveHistory: string[],
  lastMoveMessage: string,
  orientation: 'WHITE' | 'BLACK',
  onMove: (fromFile: number, fromRank: number, toFile: number, toRank: number, promotion?: string) => void,
  fetchLegalMoves?: (file: number, rank: number) => Promise<{ file: number, rank: number }[]>,
  game?: { lastMoves?: { moveQuality?: string }[] }
) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: number, to: number } | null>(null);
  const [legalMoves, setLegalMoves] = useState<{ file: number, rank: number }[]>([]);
  
  const matchFingerprint = useMemo(() => {
    return moveHistory && moveHistory.length > 0 ? moveHistory[0] : 'empty_start';
  }, [moveHistory?.[0]]);

  const storageKey = `chess_game_logs_active`;

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const savedData = sessionStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.fingerprint === matchFingerprint) {
          return parsedData.logs;
        }
      }
    } catch {}
    return [];
  });

  const [activePiece, setActivePiece] = useState<{ char: string, index: number } | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [moveQualities, setMoveQualities] = useState<Record<number, string>>({});

  const lastProcessedMessage = useRef<string | null>(null);

  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.fingerprint !== matchFingerprint) {
          setLogs([]);
          sessionStorage.removeItem(storageKey);
        }
      }
    } catch {}
  }, [matchFingerprint]);

  useEffect(() => {
    try {
      if (logs.length > 0) {
        sessionStorage.setItem(storageKey, JSON.stringify({
          fingerprint: matchFingerprint,
          logs: logs
        }));
      }
    } catch (e) {
      console.error("Failed to save logs", e);
    }
  }, [logs, matchFingerprint]);

  const squares = useMemo(() => {
    if (!boardRepresentation) return Array(64).fill('.');
    return boardRepresentation.split('|')[0].slice(0, 64).split('');
  }, [boardRepresentation]);

  const upperStatus = (gameStatus || "").toUpperCase();
  const isGameOver = isStarted && ['WON', 'LOST', 'DRAW', 'CHECKMATE', 'STALEMATE', 'RESIGNED', 'TIMEOUT', 'CLOSING', 'ABANDONED', 'FINISHED', 'DISMISSED'].some(s => upperStatus.includes(s));
  const showSyncing = (!isStarted && !isGameOver) || (upperStatus.includes('TIMEOUT') && !showGameOverModal);
  const isCheck = upperStatus.includes('CHECK') && !isGameOver;
  const isMyTurn = currentTurn?.toUpperCase() === orientation.toUpperCase();

  const getActualIndex = useCallback((visualIndex: number) => orientation === 'WHITE' ? visualIndex : 63 - visualIndex, [orientation]);
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
      setLogs([{
        text: "Game started. White to move.",
        turn: 'WHITE',
        time: new Date().toLocaleTimeString('en-GB', { hour12: false })
      }]);
    }
  }, [isStarted, logs.length]);

  const getEndGameReason = () => {
    if (upperStatus.includes('DISMISSED') || upperStatus.includes('ABANDONED')) return "Game Dismissed / Abandoned";
    if (upperStatus.includes('TIMEOUT')) {
      const loser = upperStatus.split('_')[1];
      return loser === orientation.toUpperCase() ? "You timed out!" : "Opponent timed out!";
    }
    if (upperStatus.includes('WON')) return "You won!";
    if (upperStatus.includes('LOST')) return "You lost.";
    if (upperStatus.includes('DRAW') || upperStatus.includes('STALEMATE')) return "Draw!";
    return "Game Over";
  };

  useEffect(() => {
    if (isGameOver) setShowGameOverModal(true);
  }, [isGameOver]);

  useEffect(() => {
    if (lastMoveMessage && lastMoveMessage !== lastProcessedMessage.current) {
      const isError = lastMoveMessage.includes("Illegal") || lastMoveMessage.includes("not your turn");
      
      setLogs(prev => {
        if (prev.length > 0 && prev[0].text === lastMoveMessage) {
          return prev;
        }
        return [{
          text: lastMoveMessage,
          turn: isError ? currentTurn.toUpperCase() : (currentTurn.toUpperCase() === 'WHITE' ? 'BLACK' : 'WHITE'),
          time: new Date().toLocaleTimeString('en-GB', { hour12: false }) 
        }, ...prev].slice(0, 50);
      });

      lastProcessedMessage.current = lastMoveMessage;
      if (!isError) { setSelectedSquare(null); setLegalMoves([]); }
    }
  }, [lastMoveMessage, currentTurn]);

  const { whiteCaptured, blackCaptured } = useMemo(() => {
    const currentWhite = squares.filter(s => s !== '.' && s === s.toUpperCase());
    const currentBlack = squares.filter(s => s !== '.' && s === s.toLowerCase());
    let tempWhite = [...INITIAL_PIECES.white], tempBlack = [...INITIAL_PIECES.black];
    currentWhite.forEach(p => { const idx = tempWhite.indexOf(p); if (idx > -1) tempWhite.splice(idx, 1); });
    currentBlack.forEach(p => { const idx = tempBlack.indexOf(p); if (idx > -1) tempBlack.splice(idx, 1); });
    return {
      whiteCaptured: tempBlack.sort((a, b) => PIECE_VALUES[a.toUpperCase()] - PIECE_VALUES[b.toUpperCase()]),
      blackCaptured: tempWhite.sort((a, b) => PIECE_VALUES[a.toUpperCase()] - PIECE_VALUES[b.toUpperCase()])
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
    if (isPromotion) setPromotionPending({ from: fromIndex, to: toIndex });
    else onMove(from.file, from.rank, to.file, to.rank);
  };

  const handleSquareClick = async (actualIndex: number) => {
    if (isGameOver || !isMyTurn || !isStarted) return;
    const { file, rank } = getCoordsFromIndex(actualIndex);
    const pieceAtTarget = squares[actualIndex];
    if (selectedSquare === null) {
      const isOwnPiece = (orientation === 'WHITE' && pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toUpperCase()) ||
      (orientation === 'BLACK' && pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toLowerCase());
      if (isOwnPiece) {
        setSelectedSquare(actualIndex);
        if (fetchLegalMoves) {
          const moves = await fetchLegalMoves(file, rank);
          setLegalMoves(moves);
        }
      }
    } else {
      const isLegal = legalMoves.some(m => m.file === file && m.rank === rank);
      if (isLegal) executeMove(selectedSquare, actualIndex);
      else {
        const isOwnPiece = (orientation === 'WHITE' && pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toUpperCase()) ||
        (orientation === 'BLACK' && pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toLowerCase());
        if (isOwnPiece) {
          setSelectedSquare(actualIndex);
          if (fetchLegalMoves) {
            const moves = await fetchLegalMoves(file, rank);
            setLegalMoves(moves);
          }
        } else { setSelectedSquare(null); setLegalMoves([]); }
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (isGameOver || !isMyTurn || !isStarted) return;
    const visualIndex = parseInt((event.active.id as string).split('-')[1]);
    const actualIndex = getActualIndex(visualIndex);
    setActivePiece({ char: event.active.data.current?.char, index: actualIndex });
    handleSquareClick(actualIndex); 
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePiece(null);
    const { active, over } = event;
    if (!over || isGameOver || !isMyTurn || !isStarted) return;
    const visualFrom = parseInt((active.id as string).split('-')[1]);
    const visualTo = parseInt((over.id as string).split('-')[1]);
    const fromIndex = getActualIndex(visualFrom);
    const toIndex = getActualIndex(visualTo);
    if (fromIndex !== toIndex) {
      const to = getCoordsFromIndex(toIndex);
      const isLegal = legalMoves.some(m => m.file === to.file && m.rank === to.rank);
      if (isLegal) executeMove(fromIndex, toIndex);
      else { setSelectedSquare(null); setLegalMoves([]); }
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
    showGameOverModal, squares, isGameOver, showSyncing, isCheck, isMyTurn,
    whiteCaptured, blackCaptured, pairedMoves, getEndGameReason,
    getActualIndex, getCoordsFromIndex, handleSquareClick, handleDragStart, handleDragEnd,
    formatTime
  };
};
