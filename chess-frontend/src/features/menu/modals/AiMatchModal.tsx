import React from 'react';
import { Sword, Loader2, Clock, Shield, Sliders, Palette } from 'lucide-react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl text-center max-w-md w-full space-y-6">
        <div className="flex items-center justify-center gap-3 text-blue-500 mb-1">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <Sword size={24} />
          </div>
          <h2 className="text-lg font-black tracking-tighter uppercase text-slate-900 dark:text-white">
            Configure AI Match
          </h2>
        </div>

        <div className="space-y-2 text-left">
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            <Clock size={12} /> Time Control
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([3, 10, 30] as TimeControl[]).map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 border ${
                  selectedTime === time
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                {time} MIN
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            <Shield size={12} /> Choose Your Side
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setAiPlayAsWhite(true)}
              className={`py-3.5 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 border ${
                aiPlayAsWhite 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]' 
                  : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              White (First)
            </button>
            <button 
              onClick={() => setAiPlayAsWhite(false)}
              className={`py-3.5 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 border ${
                !aiPlayAsWhite 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]' 
                  : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              Black (AI First)
            </button>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            <Sliders size={12} /> Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 3, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setAiDifficulty(lvl)}
                className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 border ${
                  aiDifficulty === lvl 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]' 
                    : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                Level {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            <Palette size={12} /> Board Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(CHESS_THEMES) as ChessThemeKey[]).map((theme) => {
              const previewColors = {
                classic: { dark: '#b58863', light: '#f0d9b5' },
                modern: { dark: '#4b7399', light: '#e2e8f0' },
                emerald: { dark: '#6a8d5c', light: '#eceed1' }
              };

              return (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`relative p-3 rounded-2xl transition-all duration-300 border-2 flex flex-col items-center gap-2.5 ${
                    selectedTheme === theme 
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-md scale-[1.02]' 
                      : 'border-transparent bg-slate-100 dark:bg-slate-800/50 hover:border-slate-700/50'
                  }`}
                >
                  <div className="w-8 h-8 grid grid-cols-2 rounded-lg overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                    <div style={{ backgroundColor: previewColors[theme].light }}></div>
                    <div style={{ backgroundColor: previewColors[theme].dark }}></div>
                    <div style={{ backgroundColor: previewColors[theme].dark }}></div>
                    <div style={{ backgroundColor: previewColors[theme].light }}></div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                    {theme}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-200 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onStartMatch}
            disabled={isAiLoading}
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
          >
            {isAiLoading && <Loader2 className="animate-spin" size={14} />}
            Start Match
          </button>
        </div>

      </div>
    </div>
  );
};
