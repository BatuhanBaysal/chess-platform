import { useEffect, useState, useCallback, useRef } from 'react';
import { Client, StompHeaders } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface ExecutedMove {
  fromFile: number; fromRank: number; toFile: number; toRank: number; pieceType: string;
}

interface GameState {
  gameId: string;
  boardRepresentation: string;
  currentTurn: string;
  status: string;
  lastMoves: ExecutedMove[];
  moveHistory: string[];
  lastMoveMessage: string; 
}

const API_BASE_URL = 'http://localhost:8080';

export const useChess = () => {
  const [game, setGame] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const gameIdRef = useRef<string | null>(null);

  const getAuthHeader = useCallback((): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  const connectWebSocket = useCallback((gameId: string) => {
    if (stompClientRef.current) stompClientRef.current.deactivate();

    const token = localStorage.getItem('token');
    const socket = new SockJS(`${API_BASE_URL}/ws-chess`);

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: token ? { 'Authorization': `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        client.subscribe(`/topic/game/${gameId}`, (message) => {
          setGame(JSON.parse(message.body));
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      }
    });

    client.activate();
    stompClientRef.current = client;
    gameIdRef.current = gameId; 
  }, []);

  const startNewGame = useCallback(async () => {
    try {
      setGame(null);
      setIsConnected(false);
      
      const res = await fetch(`${API_BASE_URL}/api/games`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader() 
        } as HeadersInit 
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data: GameState = await res.json();
      setGame(data);
      connectWebSocket(data.gameId);
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  }, [connectWebSocket, getAuthHeader]);

  useEffect(() => {
    return () => { if (stompClientRef.current) stompClientRef.current.deactivate(); };
  }, []);

  const makeMove = useCallback((fromFile: number, fromRank: number, toFile: number, toRank: number, promotionPiece?: string) => {
    const client = stompClientRef.current;
    if (client?.connected && gameIdRef.current) {
      client.publish({
        destination: '/app/move',
        body: JSON.stringify({
          gameId: gameIdRef.current,
          fromFile, fromRank, toFile, toRank,
          promotionType: promotionPiece || null 
        }),
        headers: getAuthHeader() as StompHeaders 
      });
    }
  }, [getAuthHeader]);

  const fetchLegalMoves = useCallback(async (file: number, rank: number) => {
    if (!gameIdRef.current) return [];
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/games/${gameIdRef.current}/legal-moves?file=${file}&rank=${rank}`,
        { headers: getAuthHeader() as HeadersInit }
      );
      return response.ok ? await response.json() : [];
    } catch (err) { return []; }
  }, [getAuthHeader]);

  return { game, makeMove, isConnected, fetchLegalMoves, startNewGame };
};
