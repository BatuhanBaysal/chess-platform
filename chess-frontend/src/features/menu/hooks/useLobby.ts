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
    } catch (e: unknown) {
      console.error("Lobby Sync Error:", e);
    }
  }, []);

  const handleCancelDeployment = useCallback(async () => {
    const currentRoomId = waitingRoomId;
    setWaitingRoomId(null);

    const numericUserId = Number(userId);
    if (currentRoomId && userId && !Number.isNaN(numericUserId)) {
      try {
        await cancelLobby(currentRoomId, numericUserId);
      } catch (e: unknown) {
        console.error("Cancel lobby error:", e);
      }
    }
  }, [waitingRoomId, userId]);

  useEffect(() => {
    void fetchRooms();
    const lobbyInterval = setInterval(() => {
      void fetchRooms();
    }, 3000);
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
