import React, { useEffect } from 'react';
import { Sword, TrendingUp } from 'lucide-react';

interface WaitingRoomModalProps {
  waitingRoomId: string | null;
  selectedTime: number;
  selectedTheme: string;
  onCancel: () => void;
}

export const WaitingRoomModal: React.FC<WaitingRoomModalProps> = ({
  waitingRoomId,
  selectedTime,
  selectedTheme,
  onCancel
}) => {
  useEffect(() => {
    if (!waitingRoomId) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [waitingRoomId, onCancel]);

  if (!waitingRoomId) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 p-4 sm:p-6 overscroll-contain"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 p-6 sm:p-9 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Radar Pulse */}
        <div className="relative w-20 h-20 mx-auto mb-5 mt-1">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
          <Sword className="absolute inset-0 m-auto text-indigo-600 dark:text-indigo-400" size={30} />
        </div>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-1">
          SEARCHING OPPONENT
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-5">
          Room ID: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">{waitingRoomId}</span>
        </p>

        {/* Rated Match Telemetry Banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-left mb-5">
          <TrendingUp size={18} className="shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200 block mb-0.5">
              RATED MATCH • DYNAMIC ELO
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
              Rating points are gained or lost dynamically based on your opponent's relative ELO rating.
            </span>
          </div>
        </div>

        {/* Match Settings Box */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl mb-5">
          <div className="text-left px-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Time Limit</p>
            <p className="text-sm font-black text-slate-950 dark:text-white mt-0.5">{selectedTime} MIN</p>
          </div>
          <div className="text-left px-2 border-l border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Theme Aesthetic</p>
            <p className="text-sm font-black uppercase text-slate-950 dark:text-white mt-0.5">{selectedTheme}</p>
          </div>
        </div>

        {/* Cancel Button */}
        <button 
          type="button"
          onClick={onCancel}
          className="w-full min-h-11 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/40 active:scale-98"
        >
          Cancel Matchmaking
        </button>
      </div>
    </div>
  );
};

export default WaitingRoomModal;
