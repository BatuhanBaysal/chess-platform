import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, StompHeaders } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { HintResponse } from '@/api/gameService';

interface ExecutedMove {
  fromFile: number;
  fromRank: number;
  toFile: number;
  toRank: number;
  pieceType: string;
  evaluation?: number;
  moveQuality?: string;
}

interface GameState {
  gameId: string;
  boardRepresentation: string;
  currentTurn: string;
  status: string;
  lastMoves: ExecutedMove[];
  moveHistory: string[];
  humanReadableHistory: string[];
  lastMoveMessage: string;
  whiteId?: number;
  blackId?: number;
  isStarted: boolean;
  whiteRemainingTimeMs: number;
  blackRemainingTimeMs: number;
  timeLimit: number;
}

const FINISHED_STATUSES = ['CHECKMATE', 'STALEMATE', 'RESIGNED', 'TIMEOUT', 'DRAW', 'CLOSING', 'ABANDONED', 'FINISHED', 'DISMISSED'];

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('http')) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  const host = window.location.hostname;
  return `${window.location.protocol}//${host}:8080`;
};

const BASE_URL = getBaseUrl();
const API_URL = `${BASE_URL}/api`;
const WS_URL = `${BASE_URL}/ws-chess`;

export const useChess = () => {
  const [game, setGame] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLobbyConnected, setIsLobbyConnected] = useState(false);
  const [playerColor, setPlayerColor] = useState<'WHITE' | 'BLACK' | null>(null);
  const [displayTime, setDisplayTime] = useState({ white: 0, black: 0 });
  const [gameOverResult, setGameOverResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hintData, setHintData] = useState<HintResponse | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<{ score: number; type: 'CP' | 'MATE' }>({ score: 0, type: 'CP' });
  
  const stompClientRef = useRef<Client | null>(null);
  const lobbyClientRef = useRef<Client | null>(null);
  const gameIdRef = useRef<string | null>(null);
  const lastUpdateRef = useRef<{ time: number; white: number; black: number }>({ time: 0, white: 0, black: 0 });
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingGameStateRef = useRef<GameState | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  const getAuthDetails = useCallback(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    let userId: number | null = null;
    try {
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userId = parsed.id || null;
      }
    } catch (e) {
      console.error(e);
    }
    return { token, userId, headers: token ? { 'Authorization': `Bearer ${token}` } : {} };
  }, []);

  const syncPlayerColor = useCallback((data: GameState) => {
    const { userId } = getAuthDetails();
    if (userId !== null) {
      if (data.whiteId && Number(data.whiteId) === Number(userId)) setPlayerColor('WHITE');
      else if (data.blackId && Number(data.blackId) === Number(userId)) setPlayerColor('BLACK');
    }
  }, [getAuthDetails]);

  const disconnectWebSocket = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const disconnectLobby = useCallback(() => {
    if (lobbyClientRef.current) {
      lobbyClientRef.current.deactivate();
      lobbyClientRef.current = null;
      setIsLobbyConnected(false);
    }
  }, []);

  const scheduleGameStateUpdate = useCallback((gameState: GameState) => {
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
            if (heartbeatIntervalRef.current) {
              clearInterval(heartbeatIntervalRef.current);
              heartbeatIntervalRef.current = null;
            }
            setGameOverResult(latestState.status);
          }
        }
        animationFrameRef.current = null;
      });
    }
  }, [syncPlayerColor]);

  const connectWebSocket = useCallback((gameId: string) => {
    if (!gameId) return;
    disconnectWebSocket();
    setGameOverResult(null);
    const { token, userId, headers } = getAuthDetails();
    const socket = new SockJS(WS_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: token ? { 'Authorization': `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        setError(null);

        if (userId && gameId) {
          heartbeatIntervalRef.current = setInterval(() => {
            if (client.connected) {
              client.publish({
                destination: '/app/game/heartbeat',
                body: JSON.stringify({ gameId, userId }),
                headers: headers as StompHeaders
              });
            }
          }, 10000);
        }

        client.subscribe(`/topic/game/${gameId}`, (message) => {
          const body = JSON.parse(message.body);
          if (body.type === 'GAME_OVER') {
            setGameOverResult(body.result);
            if (heartbeatIntervalRef.current) {
              clearInterval(heartbeatIntervalRef.current);
              heartbeatIntervalRef.current = null;
            }
          } else {
            scheduleGameStateUpdate(body as GameState);
          }
        });
        client.subscribe('/user/queue/errors', (message) => {
          try {
            const body = JSON.parse(message.body);
            if (body.type === 'DISMISSED') {
              setGameOverResult('DISMISSED');
              setGame(prev => prev ? { ...prev, status: 'ABANDONED', isStarted: false } : null);
              disconnectWebSocket();
              return;
            }
          } catch (e) {
            setError(message.body);
            setTimeout(() => setError(null), 3000);
          }
        });
        if (userId) {
          client.publish({
            destination: '/app/ready',
            body: JSON.stringify({ gameId, userId }),
            headers: headers as StompHeaders
          });
        }
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
      onWebSocketClose: () => setIsConnected(false)
    });
    client.activate();
    stompClientRef.current = client;
    gameIdRef.current = gameId;
  }, [disconnectWebSocket, getAuthDetails, scheduleGameStateUpdate]);

  const connectLobby = useCallback((roomId: string, onMatchFound: (gameId: string) => void) => {
    disconnectLobby();
    const { token } = getAuthDetails();
    const socket = new SockJS(WS_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: token ? { 'Authorization': `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setIsLobbyConnected(true);
        client.subscribe(`/topic/lobby/${roomId}`, (message) => {
          const data = JSON.parse(message.body);
          if (data.status === 'START_GAME' || data.gameId) onMatchFound(data.gameId);
        });
      },
      onDisconnect: () => setIsLobbyConnected(false),
      onWebSocketClose: () => setIsLobbyConnected(false)
    });
    client.activate();
    lobbyClientRef.current = client;
  }, [disconnectLobby, getAuthDetails]);

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
  }, [getAuthDetails, game]);

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
    setGame(prev => prev ? { ...prev, status: 'ABANDONED', isStarted: false } : null);
    disconnectWebSocket();
  }, [disconnectWebSocket, getAuthDetails]);

  const fetchLegalMoves = useCallback(async (file: number, rank: number) => {
    if (!gameIdRef.current || !game) return [];
    const { headers } = getAuthDetails();
    try {
      const response = await fetch(`${API_URL}/games/${gameIdRef.current}/legal-moves?file=${file}&rank=${rank}`, { headers: headers as HeadersInit });
      return response.ok ? await response.json() : [];
    } catch (err) {
      return [];
    }
  }, [getAuthDetails, game]);

  const getBoardMatrix = useCallback(() => {
    if (!game?.boardRepresentation) return [];
    const rows = game.boardRepresentation.match(/.{1,8}/g) || [];
    return rows.map(row => row.split(''));
  }, [game?.boardRepresentation]);

  const startNewGame = useCallback(async (existingGameId?: string) => {
    try {
      setHintData(null);
      setEvaluation({ score: 0, type: 'CP' });

      const { userId, headers } = getAuthDetails();
      const url = existingGameId ? `${API_URL}/games/${existingGameId}?userId=${userId}` : `${API_URL}/games?userId=${userId}&whiteId=${userId}`;
      const res = await fetch(url, { method: existingGameId ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...headers } as HeadersInit });
      if (!res.ok) throw new Error("Connection failed");
      const data: GameState = await res.json();
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

  const resetChessState = useCallback(async () => {
      try {
          setHintData(null);
          setEvaluation({ score: 0, type: 'CP' });

          if (gameIdRef.current && gameOverResult) { 
              const response = await fetch(`${API_URL}/games/${gameIdRef.current}/finish`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
              });
              
              if (!response.ok) {
                  console.warn("The backend did not confirm the completion or returned an error.");
              }
          }
      } catch (e) {
          console.error("Error:", e);
      } finally {
          disconnectWebSocket();
          disconnectLobby();
          setGame(null);
          setPlayerColor(null);
          gameIdRef.current = null;
          setError(null);
          setGameOverResult(null);
      }
  }, [disconnectWebSocket, disconnectLobby, gameOverResult]);

  const startAiGame = async (playAsWhite: boolean = true, difficulty: number = 3, timeLimit: number = 10) => {
    try {
      setIsAiLoading(true);
      setHintData(null);
      setEvaluation({ score: 0, type: 'CP' });

      const { userId, headers } = getAuthDetails();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${API_URL}/games/vs-ai?userId=${userId}&playAsWhite=${playAsWhite}&difficulty=${difficulty}&timeLimit=${timeLimit}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers } as HeadersInit
      });

      if (!response.ok) throw new Error("Failed to start AI game");
      
      const data: GameState = await response.json();
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
      const { headers } = getAuthDetails();
      const response = await fetch(`${API_URL}/games/${gameIdRef.current}/hint?depth=${depth}`, {
        headers: headers as HeadersInit
      });
      if (response.ok) {
        const data: HintResponse = await response.json();
        setHintData(data);
        
        if (data.evaluationScore !== undefined) {
          const score = data.evaluationScore;
          const type = Math.abs(score) > 9000 ? 'MATE' : 'CP';
          setEvaluation({ score, type });
        }

        return data;
      }
    } catch (err) {
      console.error("Failed to fetch engine hint:", err);
    } finally {
      setIsHintLoading(false);
    }
  }, [getAuthDetails]);

  return {
    game,
    displayTime,
    error,
    isConnected,
    isLobbyConnected,
    playerColor,
    gameOverResult,
    isAiLoading,
    hintData,
    isHintLoading,
    evaluation,
    connectWebSocket,
    disconnectWebSocket,
    connectLobby,
    disconnectLobby,
    makeMove,
    dismissGame,
    fetchLegalMoves,
    getBoardMatrix,
    startNewGame,
    startAiGame,
    fetchHint,
    resetChessState
  };
};
