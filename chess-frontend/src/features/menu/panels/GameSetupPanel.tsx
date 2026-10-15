import React from 'react';
import { Plus, Sword, Clock, Loader2, Globe, Cpu } from 'lucide-react';
import type { TimeControl } from '../hooks/useLobby';
import { CHESS_THEMES, type ChessThemeKey } from '../../../constants/chessThemes';

interface GameSetupPanelProps {
  selectedTime: TimeControl;
  setSelectedTime: (time: TimeControl) => void;
  selectedTheme: ChessThemeKey;
  setSelectedTheme: (theme: ChessThemeKey) => void;
  isCreating: boolean;
  onCreateRoom: () => void;
  onOpenAiModal: () => void;
}

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
    <div className="p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070b19] shadow-sm h-full flex flex-col justify-between">
      <div className="space-y-6 sm:space-y-7">
        {/* Time Control */}
        <section>
          <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest mb-3 text-slate-950 dark:text-slate-300 ml-1">
            <Clock size={12} className="text-indigo-600 dark:text-indigo-400" /> TIME CONTROL
          </label>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {([3, 10, 30] as TimeControl[]).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                aria-label={`Lobby ${t} MIN`}
                className={`min-h-11 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                  selectedTime === t
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-950 dark:text-slate-200 hover:border-indigo-500'
                }`}
              >
                {t} MIN
              </button>
            ))}
          </div>
        </section>

        {/* Board Aesthetic */}
        <section>
          <label className="block text-[11px] font-black uppercase tracking-widest mb-3 text-slate-950 dark:text-slate-300 ml-1">
            BOARD AESTHETIC
          </label>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {(Object.keys(CHESS_THEMES) as ChessThemeKey[]).map(themeKey => {
              const themeConfig = CHESS_THEMES[themeKey];

              return (
                <button
                  key={themeKey}
                  onClick={() => setSelectedTheme(themeKey)}
                  aria-label={`Lobby Theme ${themeKey}`}
                  className={`min-h-14.5 p-2.5 sm:p-3 rounded-xl transition-all border-2 flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedTheme === themeKey
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 grid grid-cols-2 rounded-lg overflow-hidden shadow-inner border border-black/15 dark:border-white/10">
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
        </section>

        {/* Action Buttons */}
        <div className="space-y-3.5 pt-1">
          <button
            onClick={onCreateRoom}
            disabled={isCreating}
            className="w-full min-h-12 py-3.5 px-4 sm:px-5 flex items-center justify-between rounded-xl font-black uppercase tracking-wider text-xs transition-all bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 active:scale-98 shadow-md disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isCreating ? (
                <Loader2 className="animate-spin text-indigo-400" size={16} />
              ) : (
                <Plus size={16} className="shrink-0" />
              )}
              <span className="truncate">INITIALIZE MATCH</span>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-[10px] bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-950 px-2.5 py-1 rounded-full font-bold">
              <Globe size={11} className="text-indigo-400 dark:text-indigo-600" />
              <span>ONLINE</span>
            </div>
          </button>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-800"></div>
            </div>
            <span className="relative px-3 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-[#070b19] text-slate-900 dark:text-slate-400">
              OR
            </span>
          </div>

          <button
            onClick={onOpenAiModal}
            aria-label="Play vs Computer Play Computer"
            className="w-full min-h-12 py-3.5 px-4 sm:px-5 flex items-center justify-between rounded-xl font-black uppercase tracking-wider text-xs transition-all bg-indigo-600 hover:bg-indigo-500 text-white active:scale-98 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Sword size={16} className="shrink-0" />
              <span className="truncate">PLAY VS COMPUTER</span>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-[10px] bg-indigo-800/80 text-white px-2.5 py-1 rounded-full font-bold">
              <Cpu size={11} />
              <span>AI ENGINE</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetupPanel;
