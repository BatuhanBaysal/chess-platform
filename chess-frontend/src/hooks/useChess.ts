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
  lastMoveMessage: string;
  whiteId?: number;
  blackId?: number;
}

const BASE_URL = 'http://localhost:8080';
const API_URL = `${BASE_URL}/api`;
const WS_URL = `${BASE_URL}/ws-chess`;

export const useChess = () => {
  const [game, setGame] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerColor, setPlayerColor] = useState<'WHITE' | 'BLACK' | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const gameIdRef = useRef<string | null>(null);

  const getAuthDetails = useCallback(() => {
    const token = localStorage.getItem('token');
    const directUserId = localStorage.getItem('userId');
    const storedUser = localStorage.getItem('user');
    
    let userId: number | null = null;
    try {
      if (directUserId) {
        userId = Number(directUserId);
      } else if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userId = parsed.id || parsed.userId || null;
      }
    } catch (e) {
      userId = null;
    }
    
    return {
      token,
      userId,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    };
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const resetChessState = useCallback(() => {
    disconnectWebSocket();
    setGame(null);
    setPlayerColor(null);
    gameIdRef.current = null;
  }, [disconnectWebSocket]);

  const syncPlayerColor = useCallback((data: GameState) => {
    const { userId } = getAuthDetails();
    if (userId !== null) {
      if (data.whiteId && Number(data.whiteId) === Number(userId)) {
        setPlayerColor('WHITE');
      } else if (data.blackId && Number(data.blackId) === Number(userId)) {
        setPlayerColor('BLACK');
      }
    }
  }, [getAuthDetails]);

  const connectWebSocket = useCallback((gameId: string) => {
    disconnectWebSocket();
    const { token } = getAuthDetails();
    const socket = new SockJS(WS_URL);
    
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: token ? { 'Authorization': `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        client.subscribe(`/topic/game/${gameId}`, (message) => {
          const updatedGame: GameState = JSON.parse(message.body);
          setGame(updatedGame);
          syncPlayerColor(updatedGame);
        });
      },
      onDisconnect: () => setIsConnected(false)
    });

    client.activate();
    stompClientRef.current = client;
    gameIdRef.current = gameId;
  }, [disconnectWebSocket, getAuthDetails, syncPlayerColor]);

  const startNewGame = useCallback(async (roomId?: string) => {
    try {
      const { userId, headers: authHeaders } = getAuthDetails();
      const isRejoin = Boolean(roomId);
      const params = new URLSearchParams();
      
      if (userId) {
        if (isRejoin) params.append('blackId', userId.toString());
        else params.append('whiteId', userId.toString());
      }

      const url = isRejoin 
        ? `${API_URL}/games/${roomId}?${params.toString()}` 
        : `${API_URL}/games?${params.toString()}`;

      const res = await fetch(url, { 
        method: isRejoin ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders } as HeadersInit 
      });

      if (!res.ok) throw new Error("Game creation failed");

      const data: GameState = await res.json();
      gameIdRef.current = data.gameId;
      setGame(data);
      syncPlayerColor(data);
      connectWebSocket(data.gameId);
      
      if (!isRejoin) window.history.replaceState(null, '', `/game/${data.gameId}`);
    } catch (err) {
      console.error(err);
    }
  }, [connectWebSocket, getAuthDetails, syncPlayerColor]);

  const makeMove = useCallback((roomId: string, fromFile: number, fromRank: number, toFile: number, toRank: number, promotionPiece?: string) => {
    const client = stompClientRef.current;
    const { headers } = getAuthDetails();
    
    const currentStatus = game?.status?.toUpperCase() || 'ACTIVE';
    const isFinished = ['CHECKMATE', 'RESIGNED', 'STALEMATE', 'DRAW', 'TIMEOUT'].includes(currentStatus);
    
    if (!game || isFinished) return;

    if (client?.connected && roomId) {
      client.publish({
        destination: '/app/move',
        body: JSON.stringify({
          gameId: String(roomId),
          fromFile: Number(fromFile),
          fromRank: Number(fromRank),
          toFile: Number(toFile),
          toRank: Number(toRank),
          promotionType: promotionPiece || null 
        }),
        headers: headers as StompHeaders 
      });
    }
  }, [getAuthDetails, game]);

  const fetchLegalMoves = useCallback(async (file: number, rank: number) => {
    const currentStatus = game?.status?.toUpperCase() || 'ACTIVE';
    const isFinished = ['CHECKMATE', 'STALEMATE', 'RESIGNED', 'DRAW', 'TIMEOUT'].includes(currentStatus);
    
    if (!gameIdRef.current || !game || isFinished) return [];
    
    const { headers } = getAuthDetails();
    try {
      const response = await fetch(
        `${API_URL}/games/${gameIdRef.current}/legal-moves?file=${file}&rank=${rank}`,
        { headers: headers as HeadersInit }
      );
      return response.ok ? await response.json() : [];
    } catch (err) { 
      return []; 
    }
  }, [getAuthDetails, game]);

  return { game, makeMove, isConnected, fetchLegalMoves, startNewGame, playerColor, resetChessState };
};
