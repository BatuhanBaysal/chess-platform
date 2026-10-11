export type GameStatus =
  | 'WAITING_FOR_PLAYERS'
  | 'IN_PROGRESS'
  | 'CHECKMATE'
  | 'STALEMATE'
  | 'DRAW'
  | 'RESIGNED'
  | 'TIMEOUT'
  | 'ABANDONED'
  | 'CLOSING';

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_GUEST';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AdminActiveGameResponseDTO {
  gameId: string;
  whitePlayerId: number | null;
  blackPlayerId: number | null;
  status: GameStatus;
  whiteRemainingTimeMs: number;
  blackRemainingTimeMs: number;
}

export interface AdminUserResponseDTO {
  id: number;
  username: string;
  email: string;
  eloRating: number | null;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  role: UserRole;
  createdAt: string; 
}

export interface AuditLogResponse {
  id: number;
  adminId: number | null;
  adminUsername: string;
  actionType: string;
  details: string;
  createdAt: string; 
}
