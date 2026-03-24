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
}

export const useChess = () => {
  const [game, setGame] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const stompClientRef = useRef<Client | null>(null);
  const gameIdRef = useRef<string | null>(null);

  const connectWebSocket = useCallback((gameId: string) => {
    const socket = new SockJS('http://localhost:8080/ws-chess');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str), 
      onConnect: () => {
        setIsConnected(true);
        console.log("Connected to WebSocket");

        client.subscribe(`/topic/game/${gameId}`, (message) => {
          const updatedGame: GameState = JSON.parse(message.body);
          setGame(updatedGame);
        });

        client.subscribe(`/topic/errors`, (message) => {
          alert("Move Error: " + message.body);
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log("Disconnected from WebSocket");
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    client.activate();
    stompClientRef.current = client;
  }, []);

  useEffect(() => {
    fetch('http://localhost:8080/api/games', { method: 'POST' })
      .then(res => res.json())
      .then((data: GameState) => {
        setGame(data);
        gameIdRef.current = data.gameId;
        connectWebSocket(data.gameId);
      })
      .catch(err => console.error("Game creation error:", err));

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [connectWebSocket]);

  const makeMove = useCallback((
    fromFile: number, 
    fromRank: number, 
    toFile: number, 
    toRank: number, 
    promotionPiece?: string 
  ) => {
    const client = stompClientRef.current;
    
    if (client && client.connected && gameIdRef.current) {
      const movePayload = {
        gameId: gameIdRef.current,
        fromFile,
        fromRank,
        toFile,
        toRank,
        promotionType: promotionPiece || null 
      };
        
      client.publish({
        destination: '/app/move',
        body: JSON.stringify(movePayload)
      });
    } else {
      console.warn("WebSocket not connected. Move cannot be sent.");
    }
  }, []); 

  return { game, makeMove, isConnected };
};
