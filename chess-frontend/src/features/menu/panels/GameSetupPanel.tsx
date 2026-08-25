import React from 'react';
import { Plus, Sword, Clock, Loader2, Globe, Cpu } from 'lucide-react';
import type { ChessTheme, TimeControl } from '../hooks/useLobby';

interface GameSetupPanelProps {
  selectedTime: TimeControl;
  setSelectedTime: (time: TimeControl) => void;
  selectedTheme: ChessTheme;
  setSelectedTheme: (theme: ChessTheme) => void;
  isCreating: boolean;
  onCreateRoom: () => void;
  onOpenAiModal: () => void;
}

const THEME_PREVIEWS = {
  classic: { dark: '#b58863', light: '#f0d9b5' },
  modern: { dark: '#4b7399', light: '#e2e8f0' },
  emerald: { dark: '#6a8d5c', light: '#eceed1' }
};

export const GameSetupPanel: React.FC<GameSetupPanelProps> = ({
  selectedTime,
  setSelectedTime,
  selectedTheme,
  setSelectedTheme,
  isCreating,
  onCreateRoom,
  onOpenAiModal,
}) => {
  return (
    <div className="p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-sm">
      <div className="space-y-8">
        
        <section>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-3 text-slate-500 dark:text-slate-400 ml-1">
            <Clock size={12} /> Time Control
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([3, 10, 30] as TimeControl[]).map(t => (
              <button 
                key={t} 
                onClick={() => setSelectedTime(t)} 
                className={`py-3.5 rounded-2xl text-[10px] font-black transition-all duration-300 border ${
                  selectedTime === t 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/25 scale-[1.02]' 
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                {t} MIN
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-3 text-slate-500 dark:text-slate-400 ml-1">
            Board Aesthetic
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['classic', 'modern', 'emerald'] as ChessTheme[]).map(theme => (
              <button 
                key={theme} 
                onClick={() => setSelectedTheme(theme)} 
                className={`relative p-3.5 rounded-2xl transition-all duration-300 border-2 flex flex-col items-center gap-3 ${
                  selectedTheme === theme 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-md scale-[1.02]' 
                    : 'border-transparent bg-slate-100 dark:bg-slate-800/40 hover:border-slate-700/50'
                }`}
              >
                <div className="w-10 h-10 grid grid-cols-2 rounded-xl overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                  <div style={{ backgroundColor: THEME_PREVIEWS[theme].light }}></div>
                  <div style={{ backgroundColor: THEME_PREVIEWS[theme].dark }}></div>
                  <div style={{ backgroundColor: THEME_PREVIEWS[theme].dark }}></div>
                  <div style={{ backgroundColor: THEME_PREVIEWS[theme].light }}></div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                  {theme}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-4 pt-2">
          <button 
            onClick={onCreateRoom} 
            disabled={isCreating}
            className="w-full relative py-5 px-6 flex items-center justify-center rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-white/5 disabled:opacity-50 group"
          >
            <div className="flex items-center gap-2.5">
              {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} className="transition-transform group-hover:rotate-90 duration-300" />}
              <span>Initialize Match</span>
            </div>
            <div className="absolute right-4 flex items-center gap-1.5 text-[9px] bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-3 py-1.5 rounded-full font-extrabold tracking-wider">
              <Globe size={11} className="text-blue-400 dark:text-blue-600" />
              <span>Online</span>
            </div>
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <span className="relative px-4 text-[9px] font-black uppercase tracking-widest bg-white dark:bg-[#060a17] text-slate-400">
              OR
            </span>
          </div>

          <button 
            onClick={onOpenAiModal}
            className="w-full relative py-5 px-6 flex items-center justify-center rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/25 group"
          >
            <div className="flex items-center gap-2.5">
              <Sword size={16} className="transition-transform group-hover:-translate-y-0.5 duration-300" />
              <span>Play vs Computer</span>
            </div>
            <div className="absolute right-4 flex items-center gap-1.5 text-[9px] bg-white/15 text-white px-3 py-1.5 rounded-full font-extrabold tracking-wider backdrop-blur-sm">
              <Cpu size={11} />
              <span>AI Engine</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
