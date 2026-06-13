import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, StompHeaders } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface ExecutedMove {
  fromFile: number;
  fromRank: number;
  toFile: number;
  toRank: number;
  pieceType: string;
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

  const stompClientRef = useRef<Client | null>(null);
  const lobbyClientRef = useRef<Client | null>(null);
  const gameIdRef = useRef<string | null>(null);
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
    if (!game || !game.isStarted || ['CHECKMATE', 'TIMEOUT', 'STALEMATE', 'RESIGNED', 'DRAW'].includes(game.status)) {
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
        client.subscribe(`/topic/game/${gameId}`, (message) => {
          const body = JSON.parse(message.body);
          if (body.type === 'GAME_OVER') {
            setGameOverResult(body.result);
          } else {
            setGame(body as GameState);
          }
        });
        client.subscribe('/user/queue/errors', (message) => {
          setError(message.body);
          setTimeout(() => setError(null), 3000);
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
  }, [disconnectWebSocket, getAuthDetails]);

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
    client.publish({
      destination: '/app/move',
      body: JSON.stringify({
        gameId: String(roomId),
        fromFile,
        fromRank,
        toFile,
        toRank,
        promotionType: promotionPiece || 'QUEEN'
      }),
      headers: headers as StompHeaders
    });
  }, [getAuthDetails, game]);

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
      const { userId, headers } = getAuthDetails();
      const url = existingGameId ? `${API_URL}/games/${existingGameId}?userId=${userId}` : `${API_URL}/games?userId=${userId}&whiteId=${userId}`;
      const res = await fetch(url, { method: existingGameId ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...headers } as HeadersInit });
      if (!res.ok) throw new Error("Connection failed");
      const data: GameState = await res.json();
      setGame(data);
      syncPlayerColor(data);
      connectWebSocket(data.gameId);
      return data.gameId;
    } catch (err) {
      console.error(err);
    }
  }, [connectWebSocket, getAuthDetails, syncPlayerColor]);

  const resetChessState = useCallback(async () => {
  if (gameIdRef.current && gameOverResult) { 
      try {
          await fetch(`${API_URL}/games/${gameIdRef.current}/finish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
          });
      } catch (e) {
          console.error("Error during registration:", e);
      }
  }

  disconnectWebSocket();
  disconnectLobby();
  setGame(null);
  setPlayerColor(null);
  gameIdRef.current = null;
  setError(null);
  setGameOverResult(null);
}, [disconnectWebSocket, disconnectLobby, gameOverResult]);

  return {
    game,
    displayTime,
    error,
    isConnected,
    isLobbyConnected,
    playerColor,
    gameOverResult,
    connectWebSocket,
    disconnectWebSocket,
    connectLobby,
    disconnectLobby,
    makeMove,
    fetchLegalMoves,
    getBoardMatrix,
    startNewGame,
    resetChessState
  };
};
