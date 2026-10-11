import type { GameStatus } from './admin';

export type PieceColor = 'WHITE' | 'BLACK';
export type GameResult = 'WHITE_WON' | 'BLACK_WON' | 'DRAW';
export type PromotionType = 'QUEEN' | 'ROOK' | 'BISHOP' | 'KNIGHT';

export interface ExecutedMove {
  fromFile: number;
  fromRank: number;
  toFile: number;
  toRank: number;
  pieceType: string;
  evaluation: number | null;
  moveQuality?: string | null;
}

export interface GameResponse {
  gameId: string;
  boardRepresentation: string;
  currentTurn: PieceColor;
  status: GameStatus;
  lastMoves: ExecutedMove[];
  moveHistory: string[];
  lastMoveMessage: string | null;
  whiteId: number | null;
  blackId: number | null;
  isStarted: boolean;
  whiteRemainingTimeMs: number;
  blackRemainingTimeMs: number;
  timeLimit: number | null;
}

export interface GameHistory {
  id: number;
  whitePlayerId: number | null;
  whitePlayerName: string;
  blackPlayerId: number | null;
  blackPlayerName: string;
  result: GameResult;
  finishMethod: GameStatus;
  playedAt: string;
}

export interface MoveRequest {
  gameId: string;
  fromFile: number;
  fromRank: number;
  toFile: number;
  toRank: number;
  promotionType?: PromotionType | string | null;
}

export interface HintResponse {
  bestMoveUci: string;
  evaluationScore: number;
  message: string;
}

export interface GameExportResponse {
  gameId: string;
  storageKey: string;
  fileName: string;
  sizeInBytes: number;
}

export interface ReadyRequest {
  gameId: string;
  userId: number;
}

export interface HeartbeatRequest {
  gameId: string;
  userId: number;
}

export interface DismissRequest {
  gameId: string;
  userId: number;
}

export interface GameAnalysisMessage {
  gameId: string;
  pgn: string;
  moves: string[];
  whitePlayerId: number | null;
  blackPlayerId: number | null;
}
