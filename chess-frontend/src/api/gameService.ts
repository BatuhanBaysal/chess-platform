import api from './axios';
import type {
  GameResponse,
  HintResponse,
  GameHistory,
  GameRoomResponse,
  CreateRoomRequest,
  JoinRoomRequest,
  AuthResponse
} from '../types';

export type {
  GameResponse,
  HintResponse,
  GameHistory,
  GameRoomResponse,
  CreateRoomRequest,
  JoinRoomRequest,
  AuthResponse
};

export interface LegalMove {
  file: number;
  rank: number;
}

export const loginAsGuest = async (): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/guest');
  return response.data;
};

export const createLobby = async (
  userId: number, 
  username: string, 
  timeControl: number, 
  theme: string
): Promise<string> => {
  const payload: CreateRoomRequest = {
    userId,
    username,
    time: timeControl,
    theme
  };
  const response = await api.post<string>('/api/lobby/create', payload);
  return response.data;
};

export const joinRoom = async (
  roomId: string, 
  userId: number, 
  username: string, 
  theme: string
): Promise<void> => {
  const payload: JoinRoomRequest = {
    roomId,
    userId,
    username,
    theme
  };
  await api.post('/api/lobby/join', payload);
};

export const cancelLobby = async (roomId: string, userId: number): Promise<void> => {
  await api.delete(`/api/lobby/cancel/${roomId}`, {
    params: { userId }
  });
};

export const getActiveRooms = async (): Promise<GameRoomResponse[]> => {
  try {
    const response = await api.get<GameRoomResponse[]>('/api/lobby/rooms');
    return response.data || [];
  } catch (error) {
    console.error('Lobby fetch error:', error);
    return [];
  }
};

export const getLobbyStatus = async (roomId: string): Promise<GameRoomResponse | null> => {
  try {
    const response = await api.get<GameRoomResponse>(`/api/lobby/status/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lobby status:', error);
    return null;
  }
};

export const createAiGame = async (
  userId: number, 
  playAsWhite: boolean = true, 
  difficulty: number = 3, 
  timeLimit: number = 10
): Promise<GameResponse> => {
  const response = await api.post<GameResponse>('/api/games/vs-ai', null, {
    params: { userId, playAsWhite, difficulty, timeLimit }
  });
  return response.data;
};

export const getEngineHint = async (gameId: string, depth: number = 10): Promise<HintResponse> => {
  const response = await api.get<HintResponse>(`/api/games/${gameId}/hint`, {
    params: { depth }
  });
  return response.data;
};

export const getActiveGame = async (userId: number): Promise<GameResponse | null> => {
  try {
    const response = await api.get<GameResponse>(`/api/games/active/${userId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getGameContext = async (gameId: string): Promise<GameResponse> => {
  const response = await api.get<GameResponse>(`/api/games/${gameId}`);
  return response.data;
};

export const getLegalMoves = async (gameId: string, file: number, rank: number): Promise<LegalMove[]> => {
  try {
    const response = await api.get<LegalMove[]>(`/api/games/${gameId}/legal-moves`, {
      params: { file, rank }
    });
    return response.data;
  } catch (error) {
    console.error('Legal moves fetch error:', error);
    return [];
  }
};

export const getPlayerHistory = async (userId: number): Promise<GameHistory[]> => {
  try {
    const response = await api.get<GameHistory[]>(`/api/games/history/${userId}`);
    return response.data;
  } catch (error) {
    console.error('History fetch error:', error);
    return [];
  }
};

export const finishGame = async (gameId: string): Promise<void> => {
  await api.post(`/api/games/${gameId}/finish`);
};

export const resignGame = async (gameId: string, userId: number): Promise<void> => {
  await api.post(`/api/games/${gameId}/resign`, null, {
    params: { userId }
  });
};
