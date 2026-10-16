import React, { useEffect } from 'react';
import { Bot, Loader2, Clock, Shield, Sliders, Palette, Info, X, ShieldCheck } from 'lucide-react';
import type { TimeControl } from '../hooks/useLobby';
import { CHESS_THEMES, type ChessThemeKey } from '../../../constants/chessThemes';

interface AiMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: TimeControl;
  setSelectedTime: (time: TimeControl) => void;
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  aiPlayAsWhite: boolean;
  setAiPlayAsWhite: (val: boolean) => void;
  aiDifficulty: number;
  setAiDifficulty: (val: number) => void;
  onStartMatch: () => void;
  isAiLoading: boolean;
}

export const AiMatchModal: React.FC<AiMatchModalProps> = ({
  isOpen,
  onClose,
  selectedTime,
  setSelectedTime,
  selectedTheme,
  setSelectedTheme,
  aiPlayAsWhite,
  setAiPlayAsWhite,
  aiDifficulty,
  setAiDifficulty,
  onStartMatch,
  isAiLoading
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 p-4 sm:p-6 overscroll-contain"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl max-w-xl w-full flex flex-col justify-between relative my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-7 sm:right-7 w-11 h-11 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          title="Close (ESC)"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Top Header */}
        <div className="mb-5 sm:mb-6 pr-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Bot size={24} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
              CONFIGURE AI MATCH
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Select time limits, engine difficulty, and board aesthetic.
          </p>
        </div>

        {/* Unrated Telemetry Banner */}
        <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left mb-5 sm:mb-6">
          <Info size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 block mb-0.5">
              CASUAL MATCH • UNRATED
            </span>
            <span className="font-medium text-amber-950/80 dark:text-amber-200/80 text-[11px]">
              This match does not affect your ELO rating. Designed for practice, analysis, and engine sparring.
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 sm:space-y-5">
          {/* Time Control */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2">
              <Clock size={12} className="text-indigo-600 dark:text-indigo-400" /> TIME CONTROL
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {([3, 10, 30] as TimeControl[]).map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`min-h-11 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    selectedTime === time
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {time} MIN
                </button>
              ))}
            </div>
          </div>

          {/* Side Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2">
              <Shield size={12} className="text-indigo-600 dark:text-indigo-400" /> CHOOSE YOUR SIDE
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                onClick={() => setAiPlayAsWhite(true)}
                className={`min-h-11 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                  aiPlayAsWhite
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                }`}
              >
                White (First)
              </button>
              <button
                onClick={() => setAiPlayAsWhite(false)}
                className={`min-h-11 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                  !aiPlayAsWhite
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                }`}
              >
                Black (AI First)
              </button>
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2">
              <Sliders size={12} className="text-indigo-600 dark:text-indigo-400" /> DIFFICULTY LEVEL
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {[1, 3, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setAiDifficulty(lvl)}
                  className={`min-h-11 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    aiDifficulty === lvl
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                  }`}
                >
                  Level {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Board Theme */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2">
              <Palette size={12} className="text-indigo-600 dark:text-indigo-400" /> BOARD THEME
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {(Object.keys(CHESS_THEMES) as ChessThemeKey[]).map((themeKey) => {
                const themeConfig = CHESS_THEMES[themeKey];
                return (
                  <button
                    key={themeKey}
                    onClick={() => setSelectedTheme(themeKey)}
                    className={`min-h-14 p-2.5 sm:p-3 rounded-xl transition-all border-2 flex flex-col items-center gap-1.5 cursor-pointer ${
                      selectedTheme === themeKey
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-transparent bg-slate-50 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 grid grid-cols-2 rounded-md overflow-hidden border border-black/15 dark:border-white/10 shadow-inner">
                      <div className={themeConfig.light}></div>
                      <div className={themeConfig.dark}></div>
                      <div className={themeConfig.dark}></div>
                      <div className={themeConfig.light}></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 dark:text-white">
                      {themeKey}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 sm:gap-4 pt-5 sm:pt-6">
          <button
            onClick={onClose}
            className="flex-1 min-h-11 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border border-slate-200 dark:border-transparent"
          >
            Cancel
          </button>
          <button
            onClick={onStartMatch}
            disabled={isAiLoading}
            className="flex-1 min-h-11 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isAiLoading && <Loader2 className="animate-spin text-indigo-500" size={16} />}
            <span>START MATCH</span>
          </button>
        </div>

        {/* Signature Footer */}
        <div className="pt-3.5 border-t border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mt-5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>CHESS PLATFORM</span>
          </div>
          <span>BATUHAN BAYSAL • 2026</span>
        </div>
      </div>
    </div>
  );
};

export default AiMatchModal;
