import React from 'react';
import { ArrowRight, X} from 'lucide-react';
import type { GameResponse } from '../../../api/gameService';

interface ReconnectAlertProps {
  reconnectGame: GameResponse;
  onReconnect: () => void;
  onDismiss: () => void;
}

export const ReconnectAlert: React.FC<ReconnectAlertProps> = ({
  reconnectGame,
  onReconnect,
  onDismiss
}) => {
  const matchSector = reconnectGame?.gameId ? reconnectGame.gameId.substring(0, 8) : 'ACTIVE';

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-92 max-w-sm animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5 duration-300">
      <div className="bg-white/95 dark:bg-[#070b19]/95 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-2xl shadow-indigo-950/15 dark:shadow-black/60 border border-indigo-200 dark:border-indigo-800/80 flex flex-col gap-3.5">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200">
              Active Match Found
            </span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
            aria-label="Dismiss reconnect notification"
          >
            <X size={16} />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          You have an unfinished game in progress. Reconnect to match <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">#{matchSector}</span>?
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={onReconnect}
            className="flex-1 min-h-11 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25 active:scale-95"
          >
            <span>Reconnect</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={onDismiss}
            className="min-h-11 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer active:scale-95"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReconnectAlert;
