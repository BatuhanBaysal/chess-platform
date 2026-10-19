import React from 'react';
import { Radio, ArrowLeft, Clock, Palette, Hash, Bot, Users } from 'lucide-react';
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
  const currentRoomId = gameConfig?.roomId || game?.gameId;
  const isAi = Boolean(
    game?.gameType === 'AI' ||
    game?.isAi ||
    game?.vsAi ||
    game?.mode === 'AI' ||
    game?.blackId === -1 ||
    game?.whiteId === -1 ||
    game?.blackPlayerId === -1 ||
    game?.whitePlayerId === -1
  );

  if (!game || !isConnected) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xl relative overflow-hidden transition-all">
          <div className="absolute inset-0 bg-radial from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

          {/* Interactive Radar / Sonar Wave Animation */}
          <div className="relative flex items-center justify-center w-28 h-28 my-4">
            <span className="absolute w-28 h-28 rounded-full bg-indigo-500/10 animate-ping duration-1000" />
            <span className="absolute w-20 h-20 rounded-full border border-indigo-500/20 dark:border-indigo-400/20" />
            <span className="absolute w-24 h-24 rounded-full border border-dashed border-indigo-500/30 dark:border-indigo-400/30 animate-[spin_6s_linear_infinite]" />
            <div className="relative w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center shadow-inner">
              <Radio size={24} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
          </div>

          {/* Connection Header & Telemetry Status */}
          <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-slate-100 mt-2">
            Establishing Connection
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs font-medium">
            Synchronizing game state with the server and negotiating match telemetry...
          </p>

          {/* Match Configuration Telemetry Panel */}
          <div className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 my-5 grid grid-cols-2 gap-2 text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Clock size={12} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">Time Limit</span>
                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 font-mono">{currentTimeControl} min</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Palette size={12} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">Theme</span>
                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 capitalize truncate block">{currentTheme}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                {isAi ? <Bot size={12} /> : <Users size={12} />}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">Mode</span>
                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate block">
                  {isAi ? 'Stockfish AI' : 'Live Multiplayer'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Hash size={12} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">Room ID</span>
                <span className="text-[11px] font-black font-mono text-slate-800 dark:text-slate-200 truncate block">
                  {currentRoomId || 'Assigning...'}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation CTA */}
          <button 
            onClick={onBackToMenu}
            className="w-full min-h-11 flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-98 shadow-xs border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft size={14} />
            <span>Cancel Matchmaking</span>
          </button>
        </div>
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
