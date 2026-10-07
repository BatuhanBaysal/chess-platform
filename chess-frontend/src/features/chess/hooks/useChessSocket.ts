import { useState, useRef, useCallback } from 'react';
import { Client, StompHeaders } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const getWsUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    const cleanUrl = apiUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');
    return `${cleanUrl}/ws-chess`;
  }
  return `${window.location.origin}/ws-chess`;
};

const WS_URL = getWsUrl();

export const useChessSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLobbyConnected, setIsLobbyConnected] = useState(false);
  
  const stompClientRef = useRef<Client | null>(null);
  const lobbyClientRef = useRef<Client | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const disconnectWebSocket = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
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

  const connectWebSocket = useCallback((
    gameId: string,
    getAuthDetails: () => { token: string | null; userId: number | null; headers: any },
    onGameStateUpdate: (body: any) => void,
    onGameOver: (result: string) => void,
    onDismissed: () => void,
    setError: (err: string | null) => void
  ) => {
    if (!gameId) return;
    disconnectWebSocket();
    
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
            onGameOver(body.result);
            if (heartbeatIntervalRef.current) {
              clearInterval(heartbeatIntervalRef.current);
              heartbeatIntervalRef.current = null;
            }
          } else {
            onGameStateUpdate(body);
          }
        });

        client.subscribe('/user/queue/errors', (message) => {
          try {
            const body = JSON.parse(message.body);
            if (body.type === 'DISMISSED') {
              onDismissed();
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
  }, [disconnectWebSocket]);

  const connectLobby = useCallback((roomId: string, getAuthDetails: () => { token: string | null }, onMatchFound: (gameId: string) => void) => {
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
  }, [disconnectLobby]);

  return {
    isConnected,
    isLobbyConnected,
    stompClientRef,
    connectWebSocket,
    disconnectWebSocket,
    connectLobby,
    disconnectLobby
  };
};
