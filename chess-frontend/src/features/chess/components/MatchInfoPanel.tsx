import React, { useState, useEffect } from 'react';
import { Timer, LogOut, Cpu, User, Shield } from 'lucide-react';
import { EvaluationBar } from './EvaluationBar';
import type { HintResponse } from '@/api/gameService';

interface MatchInfoPanelProps {
  orientation: 'WHITE' | 'BLACK';
  currentTurn: string;
  isGameOver: boolean;
  whiteRemainingTimeMs?: number;
  blackRemainingTimeMs?: number;
  whiteCaptured: string[];
  blackCaptured: string[];
  pieceImages: { [key: string]: string };
  formatTime: (ms: number) => string;
  onDismissGame?: () => void;
  score?: number;
  evaluationType?: 'CP' | 'MATE';
  hintData: HintResponse | null;
  isHintLoading: boolean;
  onGetHint: () => void;
  isMyTurn?: boolean;
  whitePlayerName?: string;
  blackPlayerName?: string;
}

export const MatchInfoPanel: React.FC<MatchInfoPanelProps> = ({
  orientation, currentTurn, isGameOver, whiteRemainingTimeMs, blackRemainingTimeMs,
  whiteCaptured, blackCaptured, pieceImages, formatTime, onDismissGame,
  score = 0, evaluationType = 'CP', hintData, isHintLoading, onGetHint,
  isMyTurn = true,
  whitePlayerName = 'White Player', blackPlayerName = 'Black Player'
}) => {
  const isWhiteTurn = currentTurn?.toUpperCase() === 'WHITE';
  const isBlackTurn = currentTurn?.toUpperCase() === 'BLACK';
  
  const [displayedHint, setDisplayedHint] = useState<HintResponse | null>(null);

  useEffect(() => {
    if (hintData) {
      setDisplayedHint(hintData);
      const timer = setTimeout(() => {
        setDisplayedHint(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [hintData]);

  const isWhiteOrientation = orientation === 'WHITE';

  const topColor = isWhiteOrientation ? 'BLACK' : 'WHITE';
  const topTime = isWhiteOrientation ? (blackRemainingTimeMs || 0) : (whiteRemainingTimeMs || 0);
  const topPlayerLabel = isWhiteOrientation ? blackPlayerName : whitePlayerName;
  const isTopTurn = isWhiteOrientation ? isBlackTurn : isWhiteTurn;
  const topCaptured = isWhiteOrientation ? blackCaptured : whiteCaptured;

  const bottomColor = isWhiteOrientation ? 'WHITE' : 'BLACK';
  const bottomTime = isWhiteOrientation ? (whiteRemainingTimeMs || 0) : (blackRemainingTimeMs || 0);
  const bottomPlayerLabel = isWhiteOrientation ? whitePlayerName : blackPlayerName;
  const isBottomTurn = isWhiteOrientation ? isWhiteTurn : isBlackTurn;
  const bottomCaptured = isWhiteOrientation ? whiteCaptured : blackCaptured;

  const getPlayerStyle = (isTurn: boolean, playerColor: 'WHITE' | 'BLACK') => {
    if (playerColor === 'WHITE') {
      return isTurn
        ? 'text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-500/10 animate-pulse shadow-sm'
        : 'text-blue-900 dark:text-blue-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm';
    } else {
      return isTurn
        ? 'text-rose-600 dark:text-rose-400 border-rose-500 bg-rose-500/10 animate-pulse shadow-sm'
        : 'text-rose-900 dark:text-rose-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm';
    }
  };

  const handleCapturedImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, pieceChar: string) => {
    const target = e.currentTarget as HTMLImageElement;
    target.style.display = 'none';
    if (target.parentElement) {
      target.parentElement.innerHTML = `<span class="text-[14px] font-black font-mono opacity-50">${pieceChar}</span>`;
    }
  };

  return (
    <div className="w-full xl:w-80 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex flex-col justify-between p-3.5 shadow-inner h-full overflow-hidden">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Match & Engine Panel</span>
        </div>
        {onDismissGame && !isGameOver && (
          <button onClick={onDismissGame} title="Dismiss Game" className="text-rose-500 hover:text-rose-600 transition-colors p-1">
            <LogOut size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5 mb-1 text-slate-500 dark:text-slate-400">
          <Shield size={12} className={topColor === 'WHITE' ? 'text-blue-500' : 'text-rose-500'} />
          <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-45">{topPlayerLabel}</span>
        </div>
        <div className={`text-[13px] font-black font-mono px-3 py-1 rounded-lg border transition-all ${getPlayerStyle(isTopTurn, topColor)}`}>
          {formatTime(topTime)}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5 bg-white dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm min-h-13 overflow-hidden items-center justify-items-center">
        {topCaptured.map((p, i) => (
          <div key={i} className="w-7 h-7 flex items-center justify-center">
            <img 
              src={pieceImages[p]} 
              className="w-full h-full drop-shadow-md" 
              alt="cap" 
              onError={(e) => handleCapturedImageError(e, p)} 
            />
          </div>
        ))}
      </div>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

      <div className="flex flex-col justify-between gap-1.5 bg-white dark:bg-indigo-950/40 p-2.5 rounded-2xl border border-slate-200 dark:border-indigo-500/20 shadow-sm">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-indigo-300/80">
              Stockfish Analytics
            </span>
          </div>
        </div>

        <div className="p-0.5">
          <EvaluationBar score={score} evaluationType={evaluationType} />
        </div>

        {displayedHint ? (
          <div className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400 bg-indigo-50/80 dark:bg-indigo-900/40 py-1.5 px-3 rounded-xl border border-indigo-500/30 tracking-widest text-center shadow-md animate-fade-in">
            {displayedHint.bestMoveUci}
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 dark:text-indigo-200/70 text-center font-medium min-h-8 flex items-center justify-center">
            Click below for an engine recommendation.
          </div>
        )}

        <button
          onClick={() => {
            if (isMyTurn && !isHintLoading) {
              onGetHint();
            }
          }}
          disabled={!isMyTurn || isHintLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black py-2 px-3 rounded-xl transition-all text-[9px] shadow-md flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-[0.15em] active:scale-95"
        >
          {isHintLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculating...
            </>
          ) : (
            <>🎯 Get Smart Hint</>
          )}
        </button>
      </div>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

      <div className="grid grid-cols-5 gap-1.5 bg-white dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm min-h-13 overflow-hidden items-center justify-items-center">
        {bottomCaptured.map((p, i) => (
          <div key={i} className="w-7 h-7 flex items-center justify-center">
            <img 
              src={pieceImages[p]} 
              className="w-full h-full drop-shadow-md" 
              alt="cap" 
              onError={(e) => handleCapturedImageError(e, p)} 
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center">
        <div className={`text-[13px] font-black font-mono px-3 py-1 rounded-lg border transition-all ${getPlayerStyle(isBottomTurn, bottomColor)}`}>
          {formatTime(bottomTime)}
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-slate-500 dark:text-slate-400">
          <User size={12} className={bottomColor === 'WHITE' ? 'text-blue-500' : 'text-rose-500'} />
          <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-45">{bottomPlayerLabel}</span>
        </div>
      </div>

    </div>
  );
};

export default MatchInfoPanel;
