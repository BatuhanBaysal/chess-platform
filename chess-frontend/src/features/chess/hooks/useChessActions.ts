import { useState, useCallback, useRef } from 'react';
import type { HintResponse } from '@/api/gameService';
import { createAiGame } from '@/api/gameService';
import api from '@/api/axios';
import { StompHeaders } from '@stomp/stompjs';

const FINISHED_STATUSES = ['CHECKMATE', 'STALEMATE', 'RESIGNED', 'TIMEOUT', 'DRAW', 'CLOSING', 'ABANDONED', 'FINISHED', 'DISMISSED'];

export const useChessActions = (
  stompClientRef: React.RefObject<any>,
  gameIdRef: React.RefObject<string | null>,
  getAuthDetails: () => { token: string | null; userId: number | null; headers: any },
  syncPlayerColor: (data: any) => void,
  connectWebSocket: (gameId: string) => void,
  disconnectWebSocket: () => void,
  disconnectLobby: () => void
) => {
  const [game, setGame] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameOverResult, setGameOverResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hintData, setHintData] = useState<HintResponse | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<{ score: number; type: 'CP' | 'MATE' }>({ score: 0, type: 'CP' });
  const [selectedTheme, setSelectedTheme] = useState<any>('default');

  const pendingGameStateRef = useRef<any | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const scheduleGameStateUpdate = useCallback((gameState: any) => {
    pendingGameStateRef.current = gameState;
    
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => {
        if (pendingGameStateRef.current) {
          const latestState = pendingGameStateRef.current;
          setGame(latestState);
          syncPlayerColor(latestState);
          setHintData(null);

          if (latestState.lastMoves && latestState.lastMoves.length > 0) {
            const lastMove = latestState.lastMoves[latestState.lastMoves.length - 1];
            if (lastMove.evaluation !== undefined) {
              const score = lastMove.evaluation;
              const type = Math.abs(score) > 9000 ? 'MATE' : 'CP';
              setEvaluation({ score, type });
            }
          }

          if (latestState.status && FINISHED_STATUSES.includes(latestState.status.toUpperCase())) {
            setGameOverResult(latestState.status);
          }
        }
        animationFrameRef.current = null;
      });
    }
  }, [syncPlayerColor]);

  const makeMove = useCallback((roomId: string, fromFile: number, fromRank: number, toFile: number, toRank: number, promotionPiece?: string) => {
    const client = stompClientRef.current;
    if (!game || !client?.connected || !roomId) return;
    const { headers } = getAuthDetails();
    const normalizedPromotion = promotionPiece ? promotionPiece.toUpperCase() : 'QUEEN';

    client.publish({
      destination: '/app/move',
      body: JSON.stringify({
        gameId: String(roomId),
        fromFile,
        fromRank,
        toFile,
        toRank,
        promotionType: normalizedPromotion
      }),
      headers: headers as StompHeaders
    });
  }, [getAuthDetails, game, stompClientRef]);

  const dismissGame = useCallback(() => {
    const client = stompClientRef.current;
    const { userId } = getAuthDetails();
    if (!gameIdRef.current || !userId) return;

    if (client && client.connected) {
      client.publish({
        destination: '/app/game/dismiss',
        body: JSON.stringify({ gameId: gameIdRef.current, userId })
      });
    }
    setGameOverResult('DISMISSED');
    setGame((prev: any) => prev ? { ...prev, status: 'ABANDONED', isStarted: false } : null);
    disconnectWebSocket();
  }, [disconnectWebSocket, getAuthDetails, gameIdRef, stompClientRef]);

  const fetchLegalMoves = useCallback(async (file: number, rank: number) => {
    if (!gameIdRef.current || !game) return [];
    try {
      const response = await api.get(`/api/games/${gameIdRef.current}/legal-moves`, {
        params: { file, rank }
      });
      return response.data || [];
    } catch (err) {
      return [];
    }
  }, [game, gameIdRef]);

  const startNewGame = useCallback(async (existingGameId?: string) => {
    try {
      setHintData(null);
      setEvaluation({ score: 0, type: 'CP' });

      const { userId } = getAuthDetails();
      let response;
      
      if (existingGameId) {
        response = await api.get(`/api/games/${existingGameId}`, { params: { userId } });
      } else {
        response = await api.post('/api/games', null, { params: { userId, whiteId: userId } });
      }

      const data = response.data;
      setGame(data);
      syncPlayerColor(data);
      
      if (data.status && FINISHED_STATUSES.includes(data.status.toUpperCase())) {
        setGameOverResult(data.status);
      } else {
        connectWebSocket(data.gameId);
      }
      return data.gameId;
    } catch (err) {
      console.error(err);
    }
  }, [connectWebSocket, getAuthDetails, syncPlayerColor]);

  const startAiGame = async (playAsWhite: boolean = true, difficulty: number = 3, timeLimit: number = 10) => {
    try {
      setIsAiLoading(true);
      setHintData(null);
      setEvaluation({ score: 0, type: 'CP' });

      const { userId } = getAuthDetails();
      if (!userId) throw new Error("User not authenticated");

      const data = await createAiGame(Number(userId), playAsWhite, difficulty, Number(timeLimit));
      
      setGame(data);
      syncPlayerColor(data);
      connectWebSocket(data.gameId);
      return data.gameId;
    } catch (err) {
      console.error("AI game start error:", err);
      setError("Failed to start AI game.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchHint = useCallback(async (depth: number = 10) => {
    if (!gameIdRef.current) return;
    try {
      setIsHintLoading(true);
      const response = await api.get<HintResponse>(`/api/games/${gameIdRef.current}/hint`, {
        params: { depth }
      });
      
      const data = response.data;
      setHintData(data);
      
      if (data.evaluationScore !== undefined) {
        const score = data.evaluationScore;
        const type = Math.abs(score) > 9000 ? 'MATE' : 'CP';
        setEvaluation({ score, type });
      }

      return data;
    } catch (err) {
      console.error("Failed to fetch engine hint:", err);
    } finally {
      setIsHintLoading(false);
    }
  }, [gameIdRef]);

  const resetChessState = useCallback(async () => {
    try {
      setHintData(null);
      setEvaluation({ score: 0, type: 'CP' });

      if (gameIdRef.current && gameOverResult) { 
        await api.post(`/api/games/${gameIdRef.current}/finish`);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      disconnectWebSocket();
      disconnectLobby();
      setGame(null);
      setError(null);
      setGameOverResult(null);
    }
  }, [disconnectWebSocket, disconnectLobby, gameOverResult, gameIdRef]);

  return {
    game,
    setGame,
    error,
    setError,
    gameOverResult,
    setGameOverResult,
    isAiLoading,
    hintData,
    isHintLoading,
    evaluation,
    selectedTheme,
    setSelectedTheme,
    scheduleGameStateUpdate,
    makeMove,
    dismissGame,
    fetchLegalMoves,
    startNewGame,
    startAiGame,
    fetchHint,
    resetChessState
  };
};
