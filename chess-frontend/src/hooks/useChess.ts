import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface GameState {
  gameId: string;
  boardRepresentation: string;
  currentTurn: string;
  status: string;
}

export const useChess = () => {
  const [game, setGame] = useState<GameState | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/games', { method: 'POST' })
      .then(res => res.json())
      .then((data: GameState) => {
        setGame(data);
        connectWebSocket(data.gameId);
      })
      .catch(err => console.error("Game Initialization Error:", err));
  }, []);

  const connectWebSocket = (gameId: string) => {
    const socket = new SockJS('http://localhost:8080/ws-chess');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str), 
      onConnect: () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
        
        client.subscribe(`/topic/game/${gameId}`, (message) => {
          const updatedGame = JSON.parse(message.body);
          setGame(updatedGame);
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
      }
    });

    client.activate();
    setStompClient(client);
  };

  const makeMove = useCallback((fromFile: number, fromRank: number, toFile: number, toRank: number) => {
    if (stompClient && isConnected && game) {
      console.log(`Move Attempt: From(${fromFile}, ${fromRank}) To(${toFile}, ${toRank})`);
      
      const movePayload = {
        gameId: game.gameId,
        fromFile,
        fromRank,
        toFile,
        toRank
      };
      
      stompClient.publish({
        destination: '/app/move',
        body: JSON.stringify(movePayload)
      });
    }
  }, [stompClient, isConnected, game]);

  return { game, makeMove, isConnected };
};
