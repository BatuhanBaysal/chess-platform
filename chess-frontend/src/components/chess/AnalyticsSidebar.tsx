import React, { useState, useEffect } from 'react';
import { EvaluationBar } from './EvaluationBar';
import type { HintResponse } from '@/api/gameService';

interface AnalyticsSidebarProps {
  score?: number;
  evaluationType?: 'CP' | 'MATE';
  hintData: HintResponse | null;
  isHintLoading: boolean;
  onGetHint: () => void;
  isMyTurn?: boolean;
}

export const AnalyticsSidebar: React.FC<AnalyticsSidebarProps> = ({
  score = 0,
  evaluationType = 'CP',
  hintData,
  isHintLoading,
  onGetHint,
  isMyTurn = true
}) => {
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

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-3 gap-3 text-slate-900 dark:text-white shadow-inner w-full sm:w-72 h-full flex-col justify-between transition-colors overflow-hidden">
      <div className="flex-none">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Stockfish Analytics
          </h3>
          <span className="text-[11px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-mono font-bold">
            Engine v16
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="bg-white dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Status</span>
            <span className="text-[10px] font-black text-amber-500 font-mono flex items-center gap-1">
              🟢 Active
            </span>
          </div>
          <div className="bg-white dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Evaluation</span>
            <span className="text-xs font-black text-emerald-500 font-mono">
              {evaluationType === 'MATE' ? `M${score}` : (score > 0 ? `+${score}` : score)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center overflow-y-auto custom-spec-scroll min-h-0 my-1">
        {displayedHint ? (
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3 animate-fade-in shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-indigo-500 dark:text-indigo-300 font-black flex items-center gap-1 uppercase tracking-wider">
                💡 Suggestion
              </span>
              <span className="text-[11px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-mono font-bold">
                Best Move
              </span>
            </div>
            <div className="text-2xl font-mono font-black text-slate-900 dark:text-white mb-2 bg-indigo-500/10 py-2 px-4 rounded-lg border border-indigo-500/20 text-center tracking-widest shadow-sm">
              <span className="text-amber-500">{displayedHint.bestMoveUci}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {displayedHint.message}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center">
            <span className="text-lg mb-1 opacity-50">♟️</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
              {!isMyTurn ? "Waiting for opponent..." : "Click below for an engine recommendation."}
            </span>
          </div>
        )}
      </div>

      <div className="flex-none flex flex-col gap-3">
        <div className="bg-white dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <EvaluationBar score={score} evaluationType={evaluationType} />
        </div>

        <button
          onClick={onGetHint}
          disabled={isHintLoading || !isMyTurn}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-black py-3 px-3 rounded-xl transition-all text-[10px] shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-[0.15em] active:scale-95"
        >
          {isHintLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculating...
            </>
          ) : (
            <>🎯 Get Smart Hint</>
          )}
        </button>
      </div>
    </div>
  );
};
