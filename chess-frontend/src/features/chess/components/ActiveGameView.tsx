import React from 'react';
import { Terminal } from 'lucide-react';
import ChessBoard from './ChessBoard';
import type { ChessTheme, TimeControl } from '../../../App';

interface ActiveGameViewProps {
  game: any;
  isConnected: boolean;
  playerColor: string | null;
  selectedTheme?: ChessTheme;
  selectedTime?: TimeControl;
  gameConfig?: { theme: ChessTheme; timeControl: TimeControl; roomId: string };
  hintData: any;
  isHintLoading: boolean;
  evaluation: { score: number; type: string };
  onMove: (fF: number, fR: number, tF: number, tR: number, p?: string) => void;
  fetchLegalMoves: (file: number, rank: number) => Promise<any>;
  onRestart?: () => void;
  onBackToMenu: () => void;
  fetchHint: (depth?: number) => void;
}

export const ActiveGameView: React.FC<ActiveGameViewProps> = ({
  game,
  isConnected,
  playerColor,
  selectedTheme,
  selectedTime,
  gameConfig,
  hintData,
  isHintLoading,
  evaluation,
  onMove,
  fetchLegalMoves,
  onRestart,
  onBackToMenu,
  fetchHint,
}) => {
  const currentTheme = gameConfig?.theme || selectedTheme || 'classic';
  const currentTimeControl = gameConfig?.timeControl || selectedTime || 10;

  if (!game || !isConnected) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center flex-col gap-8 text-slate-900 dark:text-white">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border-2 border-blue-500/10 rounded-full" />
          <div className="absolute w-20 h-20 border-t-2 border-blue-500 rounded-full animate-spin" />
          <Terminal size={32} className="text-blue-500 animate-pulse" />
        </div>
        <button 
          onClick={onBackToMenu}
          className="mt-4 group flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer"
        >
          Abort Deployment
        </button>
      </div>
    );
  }

  return (
    <main className="grow flex flex-col items-center justify-center w-full px-4 py-8">
      <div className="w-full flex justify-center items-center">
        <ChessBoard 
          boardRepresentation={game?.boardRepresentation || ""} 
          isStarted={game?.isStarted || false}
          gameStatus={game?.status || "ACTIVE"}
          currentTurn={game?.currentTurn || "WHITE"} 
          moveHistory={game?.humanReadableHistory || game?.moveHistory || []} 
          lastMoveMessage={game?.lastMoveMessage || ""} 
          onMove={onMove} 
          fetchLegalMoves={fetchLegalMoves}
          onNewGame={onRestart}
          onBackToMenu={onBackToMenu} 
          theme={currentTheme}
          timeLimit={currentTimeControl}
          orientation={(playerColor || 'WHITE') as "WHITE" | "BLACK"}
          whiteRemainingTimeMs={game?.whiteRemainingTimeMs ?? (Number(currentTimeControl) * 60 * 1000)}
          blackRemainingTimeMs={game?.blackRemainingTimeMs ?? (Number(currentTimeControl) * 60 * 1000)}
          hintData={hintData}
          isHintLoading={isHintLoading}
          onGetHint={() => fetchHint(10)} 
          evaluationScore={evaluation?.score || 0}            
          evaluationType={(evaluation?.type || "CP") as "CP" | "MATE" | undefined}
          isMyTurn={game?.currentTurn?.toUpperCase() === (playerColor || 'WHITE').toUpperCase()}
          game={game}
        />
      </div>
    </main>
  );
};
