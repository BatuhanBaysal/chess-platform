import type { HintResponse } from '@/api/gameService';

export interface ChessBoardProps {
  boardRepresentation: string;
  isStarted: boolean;
  gameStatus: string;
  currentTurn: string;
  moveHistory: string[];
  lastMoveMessage: string;
  onMove: (fromFile: number, fromRank: number, toFile: number, toRank: number, promotion?: string) => void;
  fetchLegalMoves?: (file: number, rank: number) => Promise<{ file: number, rank: number }[]>;
  onNewGame?: () => void;
  onBackToMenu?: () => void;
  onDismissGame?: () => void;
  theme: 'classic' | 'modern' | 'emerald';
  timeLimit: number;
  orientation: 'WHITE' | 'BLACK';
  whiteRemainingTimeMs?: number;
  blackRemainingTimeMs?: number;
  hintData?: HintResponse | null;
  isHintLoading?: boolean;
  onGetHint?: () => void;
  evaluationScore?: number;
  evaluationType?: 'CP' | 'MATE';
  isMyTurn?: boolean;
  isConnected?: boolean;
  game?: {
    whitePlayerName?: string;
    blackPlayerName?: string;
    whitePlayerId?: number;
    blackPlayerId?: number;
    lastMoves?: { moveQuality?: string }[];
  };
}

export interface LogEntry {
  text: string;
  turn: string;
  time: string;
}

export interface MovePair {
  index: number;
  white: string;
  whiteIndex: number;
  whiteQuality?: string;
  black: string | null;
  blackIndex: number;
  blackQuality?: string;
}
