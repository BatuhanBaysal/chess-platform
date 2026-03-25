import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
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
}

interface GameLog {
  id: number;
  message: string;
  type: 'INFO' | 'ERROR' | 'SYSTEM';
  timestamp: string;
}

const API_BASE_URL = 'http://localhost:8080';

export const useChess = () => {
  const [game, setGame] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activityLogs, setActivityLogs] = useState<GameLog[]>([]); 
  
  const stompClientRef = useRef<Client | null>(null);
  const gameIdRef = useRef<string | null>(null);

  const addLog = useCallback((message: string, type: 'INFO' | 'ERROR' | 'SYSTEM' = 'INFO') => {
    setActivityLogs(prev => [{
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }, ...prev]); 
  }, []);

  const connectWebSocket = useCallback((gameId: string) => {
    if (stompClientRef.current?.active && gameIdRef.current === gameId) return;

    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }

    const socket = new SockJS(`${API_BASE_URL}/ws-chess`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        addLog("Connected to game server.", "SYSTEM");
        
        client.subscribe(`/topic/game/${gameId}`, (message) => {
          const updatedGame: GameState = JSON.parse(message.body);
          setGame(updatedGame);
          if (updatedGame.lastMoveMessage) {
            addLog(updatedGame.lastMoveMessage, "INFO");
          }
        });

        client.subscribe(`/topic/game/${gameId}/errors`, (message) => {
          addLog(message.body, "ERROR");
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        addLog("Disconnected from server.", "SYSTEM");
      }
    });

    client.activate();
    stompClientRef.current = client;
    gameIdRef.current = gameId; 
  }, [addLog]);

  const startNewGame = useCallback(async () => {
    try {
      setActivityLogs([]); 
      setGame(null); 
      
      const res = await fetch(`${API_BASE_URL}/api/games`, { method: 'POST' });
      const data: GameState = await res.json();
      
      setGame(data);
      addLog("New game session initialized.", "SYSTEM");
      connectWebSocket(data.gameId);
    } catch (err) {
      addLog("Failed to start new game.", "ERROR");
      console.error("New game error:", err);
    }
  }, [connectWebSocket, addLog]);

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE_URL}/api/games`, { method: 'POST' })
      .then(res => res.json())
      .then((data: GameState) => {
        if (!isMounted) return;
        setGame(data);
        connectWebSocket(data.gameId);
      })
      .catch(err => console.error("Game initialization error:", err));

    return () => {
      isMounted = false;
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, [connectWebSocket]);

  const makeMove = useCallback((
    fromFile: number, fromRank: number, 
    toFile: number, toRank: number, 
    promotionPiece?: string 
  ) => {
    const client = stompClientRef.current;
    if (client?.connected && gameIdRef.current) {
      client.publish({
        destination: '/app/move',
        body: JSON.stringify({
          gameId: gameIdRef.current,
          fromFile, fromRank, toFile, toRank,
          promotionType: promotionPiece || null 
        })
      });
    }
  }, []);

  const fetchLegalMoves = useCallback(async (file: number, rank: number) => {
    const currentId = gameIdRef.current;
    if (!currentId) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${currentId}/legal-moves?file=${file}&rank=${rank}`);
      return response.ok ? await response.json() : [];
    } catch (err) {
      return [];
    }
  }, []);

  return { 
    game, 
    makeMove, 
    isConnected, 
    fetchLegalMoves, 
    startNewGame,
    activityLogs 
  };
};
