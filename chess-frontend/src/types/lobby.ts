import type { PieceColor } from './game';

export type RoomStatus = 'WAITING' | 'STARTING' | 'IN_PROGRESS' | 'CANCELLED';

export interface CreateRoomRequest {
  userId: number;
  username: string;
  time: number;
  theme: string;
}

export interface JoinRoomRequest {
  roomId: string;
  userId: number;
  username: string;
  theme: string;
}

export interface GameRoomResponse {
  roomId: string;
  hostId: number;
  hostName: string;
  blackPlayerId: number | null;
  blackPlayerName: string | null;
  status: RoomStatus | string;
  timeLimit: number;
  theme: string;
}

export interface MatchFoundMessage {
  gameId: string;
  status: string;
  color: PieceColor | string;
  opponentId: number | null;
  opponentName: string | null;
  theme: string;
}
