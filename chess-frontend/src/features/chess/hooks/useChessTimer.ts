import { useState, useEffect, useRef } from 'react';

const FINISHED_STATUSES = ['CHECKMATE', 'STALEMATE', 'RESIGNED', 'TIMEOUT', 'DRAW', 'CLOSING', 'ABANDONED', 'FINISHED', 'DISMISSED'];

export const useChessTimer = (game: any) => {
  const [displayTime, setDisplayTime] = useState({ white: 0, black: 0 });
  const lastUpdateRef = useRef<{ time: number; white: number; black: number }>({ time: 0, white: 0, black: 0 });

  useEffect(() => {
    if (game) {
      lastUpdateRef.current = {
        time: Date.now(),
        white: game.whiteRemainingTimeMs,
        black: game.blackRemainingTimeMs
      };
    }
  }, [game?.whiteRemainingTimeMs, game?.blackRemainingTimeMs]);

  useEffect(() => {
    if (game) {
      setDisplayTime({
        white: game.whiteRemainingTimeMs,
        black: game.blackRemainingTimeMs
      });
    }
  }, [game?.gameId]);

  useEffect(() => {
    if (!game || !game.isStarted || FINISHED_STATUSES.includes(game.status.toUpperCase())) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastUpdateRef.current.time;

      setDisplayTime(_prev => {
        const isWhiteTurn = game.currentTurn === 'WHITE';
        return {
          white: isWhiteTurn ? Math.max(0, lastUpdateRef.current.white - elapsed) : lastUpdateRef.current.white,
          black: !isWhiteTurn ? Math.max(0, lastUpdateRef.current.black - elapsed) : lastUpdateRef.current.black
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.isStarted, game?.currentTurn, game?.status, game?.gameId]);

  return { displayTime, lastUpdateRef };
};
