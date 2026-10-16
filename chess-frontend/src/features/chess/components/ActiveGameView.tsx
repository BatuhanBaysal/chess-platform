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
      <div className="min-h-[80vh] flex items-center justify-center flex-col gap-6 text-slate-950 dark:text-white px-4">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-2 border-indigo-500/10 rounded-full" />
          <div className="absolute w-16 h-16 border-t-2 border-indigo-600 dark:border-indigo-400 rounded-full animate-spin" />
          <Terminal size={26} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
        </div>
        <button 
          onClick={onBackToMenu}
          className="min-h-11 flex items-center gap-2 px-6 py-2.5 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95"
        >
          Abort Deployment
        </button>
      </div>
    );
  }

  return (
    <main className="grow flex flex-col items-center justify-center w-full max-w-full px-2 sm:px-4 py-4 sm:py-6">
      <div className="w-full max-w-full flex justify-center items-center">
        <ChessBoard 
          key={game?.gameId || 'active-game'}
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

export default ActiveGameView;
