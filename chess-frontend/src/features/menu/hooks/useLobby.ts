import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import { cancelLobby } from '../../../api/gameService';

export type ChessTheme = 'classic' | 'modern' | 'emerald';
export type TimeControl = 3 | 10 | 30;

export interface GameRoom {
  roomId: string;
  hostName: string;
  timeLimit?: number;
  theme?: ChessTheme;
}

export const useLobby = (userId?: string) => {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [waitingRoomId, setWaitingRoomId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ChessTheme>('classic');
  const [selectedTime, setSelectedTime] = useState<TimeControl>(10);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/api/lobby/rooms');
      setRooms(res.data);
    } catch (e) {
      console.error("Lobby Sync Error");
    }
  }, []);

  const handleCancelDeployment = useCallback(async () => {
    if (waitingRoomId && userId) {
      try {
        await cancelLobby(waitingRoomId, Number(userId));
      } catch (e) {
        console.error("Cancel lobby error:", e);
      }
    }
    setWaitingRoomId(null);
  }, [waitingRoomId, userId]);

  useEffect(() => {
    fetchRooms();
    const lobbyInterval = setInterval(fetchRooms, 3000);
    return () => clearInterval(lobbyInterval);
  }, [fetchRooms]);

  return {
    rooms,
    isCreating,
    setIsCreating,
    waitingRoomId,
    setWaitingRoomId,
    selectedTheme,
    setSelectedTheme,
    selectedTime,
    setSelectedTime,
    fetchRooms,
    handleCancelDeployment
  };
};
