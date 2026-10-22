import React from 'react';
import { Plus, Sword, Clock, Loader2, Globe, Cpu, Info, Palette, Sparkles } from 'lucide-react';
import type { TimeControl } from '../hooks/useLobby';
import { CHESS_THEMES, type ChessThemeKey } from '../../../constants/chessThemes';
import { Tooltip } from '../../../components/ui/Tooltip';

interface GameSetupPanelProps {
  selectedTime: TimeControl;
  setSelectedTime: (time: TimeControl) => void;
  selectedTheme: ChessThemeKey;
  setSelectedTheme: (theme: ChessThemeKey) => void;
  isCreating: boolean;
  onCreateRoom: () => void;
  onOpenAiModal: () => void;
}

const TIME_TOOLTIPS: Record<number, string> = {
  3: 'Blitz: 3 minutes per player — fast tactical play',
  10: 'Rapid: 10 minutes per player — standard competitive format',
  30: 'Classical: 30 minutes per player — deep strategic calculation',
};

const THEME_TOOLTIPS: Record<string, string> = {
  classic: 'Classic: Traditional warm wood & tournament contrast',
  modern: 'Modern: Clean slate & high-contrast minimal aesthetic',
  emerald: 'Emerald: Club-standard green & buff felt competition board',
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
    <div className="p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070b19] shadow-sm h-full flex flex-col justify-between">
      <div className="space-y-6 sm:space-y-8">
        {/* Time Control */}
        <section>
          <div className="flex items-center gap-1.5 mb-3 ml-1">
            <Clock size={12} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-300">
              TIME CONTROL
            </span>
            <Tooltip content="Match clock duration per player">
              <Info size={11} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
            {([3, 10, 30] as TimeControl[]).map(t => (
              <Tooltip key={t} content={TIME_TOOLTIPS[t]} position="top" className="w-full relative">
                <button
                  type="button"
                  onClick={() => setSelectedTime(t)}
                  aria-label={`Select ${t} minutes match duration`}
                  className={`w-full min-h-11 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    selectedTime === t
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-950 dark:text-slate-200 hover:border-indigo-500'
                  }`}
                >
                  {t} MIN
                </button>
              </Tooltip>
            ))}
          </div>
        </section>

        {/* Board Theme */}
        <section>
          <div className="flex items-center gap-1.5 mb-3 ml-1">
            <Palette size={12} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-300">
              BOARD THEME
            </span>
            <Tooltip content="Choose your preferred board color palette and piece contrast">
              <Info size={11} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
            {(Object.keys(CHESS_THEMES) as ChessThemeKey[]).map(themeKey => {
              const themeConfig = CHESS_THEMES[themeKey];
              const tooltipText = THEME_TOOLTIPS[themeKey] || `${themeKey.toUpperCase()} color theme`;

              return (
                <Tooltip key={themeKey} content={tooltipText} position="top" className="w-full relative">
                  <button
                    type="button"
                    onClick={() => setSelectedTheme(themeKey)}
                    aria-label={`Lobby Theme ${themeKey}`}
                    className={`w-full min-h-15 p-2.5 sm:p-3 rounded-xl transition-all border-2 flex flex-col items-center gap-1.5 cursor-pointer ${
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
                </Tooltip>
              );
            })}
          </div>
        </section>

        {/* Action Buttons with Tooltips */}
        <div className="space-y-4 pt-2">
          <Tooltip 
            content="Create an open room for online ranked matchmaking" 
            position="top" 
            className="w-full relative block"
          >
            <button
              type="button"
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
                <span className="truncate">FIND MATCH (ONLINE)</span>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 text-[10px] bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-950 px-2.5 py-1 rounded-full font-bold">
                <Globe size={11} className="text-indigo-400 dark:text-indigo-600" />
                <span>ONLINE</span>
              </div>
            </button>
          </Tooltip>

          <div className="relative flex items-center justify-center py-0.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-800"></div>
            </div>
            <span className="relative px-3 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-[#070b19] text-slate-900 dark:text-slate-400">
              OR
            </span>
          </div>

          <Tooltip 
            content="Start an unrated practice game against the Stockfish AI engine" 
            position="top" 
            className="w-full relative block"
          >
            <button
              type="button"
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
          </Tooltip>

          {/* Engine Assistance Notice */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 text-[11px] text-slate-600 dark:text-slate-400 shadow-2xs">
            <Sparkles size={13} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
            <p className="leading-snug font-medium">
              <span className="font-black text-indigo-950 dark:text-indigo-300 uppercase tracking-wider text-[10px] mr-1">
                Engine Assist:
              </span>
              Stockfish AI move suggestions and live evaluation are available during both Online and Practice matches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSetupPanel;
