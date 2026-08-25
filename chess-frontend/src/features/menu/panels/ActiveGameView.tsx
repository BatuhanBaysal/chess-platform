import React from 'react';
import ChessBoard from '../../chess/components/ChessBoard';
import type { ChessTheme, TimeControl } from '../hooks/useLobby';

interface ActiveGameViewProps {
  activeGameId: string;
  game: any;
  playerColor: 'WHITE' | 'BLACK' | null;
  selectedTheme: ChessTheme;
  selectedTime: TimeControl;
  isConnected: boolean; 
  makeMove: (gameId: string, fromFile: number, fromRank: number, toFile: number, toRank: number, promotion?: string) => void;
  fetchLegalMoves: (gameId: string, file: number, rank: number) => Promise<any>;
  onBackToMenu: () => void;
  hintData?: any;
  isHintLoading?: boolean;
  evaluation?: { score: number; type: string };
  fetchHint?: (depth?: number) => void;
}

export const ActiveGameView: React.FC<ActiveGameViewProps> = ({
  activeGameId,
  game,
  playerColor,
  selectedTheme,
  selectedTime,
  isConnected, 
  makeMove,
  fetchLegalMoves,
  onBackToMenu,
  hintData,
  isHintLoading,
  evaluation,
  fetchHint,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center animate-in fade-in duration-500">
      <ChessBoard
        boardRepresentation={game?.boardRepresentation || ""}
        isStarted={game?.isStarted || false}
        gameStatus={game?.status || "ACTIVE"}
        currentTurn={game?.currentTurn || "WHITE"}
        moveHistory={game?.moveHistory || []}
        lastMoveMessage={game?.lastMoveMessage || ""}
        onMove={(f, r, tf, tr, prom) => makeMove(activeGameId, f, r, tf, tr, prom)}
        fetchLegalMoves={(f, r) => fetchLegalMoves(activeGameId, f, r)} 
        theme={selectedTheme}
        timeLimit={game?.timeLimit || selectedTime} 
        orientation={playerColor || 'WHITE'}
        whiteRemainingTimeMs={game?.whiteRemainingTimeMs}
        blackRemainingTimeMs={game?.blackRemainingTimeMs}
        onBackToMenu={onBackToMenu}
        hintData={hintData}
        isHintLoading={isHintLoading}
        onGetHint={fetchHint ? () => fetchHint(10) : undefined}
        evaluationScore={evaluation?.score}
        evaluationType={evaluation?.type as "CP" | "MATE" | undefined}
        isMyTurn={game?.currentTurn?.toUpperCase() === (playerColor || 'WHITE').toUpperCase()}
        game={game}
        isConnected={isConnected}
      />
    </div>
  );
};
