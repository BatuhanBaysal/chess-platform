import React, { useMemo } from 'react';
import { Swords, Flame, Sparkles, Trophy } from 'lucide-react';
import { CHESS_QUOTES } from '../../../constants/chessQuotes';

interface DashboardHeroBannerProps {
  username?: string;
  eloRating?: number | null;
  totalGames?: number;
  onQuickMatch: () => void;
  isCreating?: boolean;
}

export const DashboardHeroBanner: React.FC<DashboardHeroBannerProps> = ({
  username = 'Player',
  eloRating,
  totalGames = 0,
  onQuickMatch,
  isCreating = false,
}) => {
  const todayQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * CHESS_QUOTES.length);
    return CHESS_QUOTES[randomIndex];
  }, []);

  const displayRating = eloRating ?? 1200;

  const greetingTitle = useMemo(() => {
    const isGuest = username.toLowerCase().startsWith('guest_');
    if (isGuest) return `Welcome, ${username}`;
    if (totalGames === 0) return `Welcome to Chess Platform, ${username}`;
    return `Welcome back, ${username}`;
  }, [username, totalGames]);

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 bg-linear-to-r from-indigo-50/90 via-slate-50 to-purple-50/80 dark:from-indigo-950/40 dark:via-[#070b19] dark:to-purple-950/30 p-6 sm:p-8 backdrop-blur-md shadow-sm transition-colors duration-200">
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-10 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100/70 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
              <Flame size={12} className="text-amber-500 dark:text-amber-400" />
              <span>Ranked Season</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 shadow-xs">
              <Trophy size={11} className="text-amber-500 dark:text-amber-400" />
              <span>{displayRating} ELO</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
            <span>{greetingTitle}</span>
            <span className="inline-block hover:rotate-12 transition-transform duration-300">⚔️</span>
          </h1>

          {/* Daily Chess Quote */}
          <div className="flex items-start gap-2 pt-1 text-slate-600 dark:text-slate-300 text-xs sm:text-[13px] font-medium leading-relaxed italic">
            <Sparkles size={14} className="shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5 not-italic" />
            <p>
              "{todayQuote.quote}" — <span className="font-bold text-slate-900 dark:text-slate-100 not-italic">{todayQuote.author}</span>
            </p>
          </div>
        </div>

        {/* Quick Match Action */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={onQuickMatch}
            disabled={isCreating}
            className="w-full sm:w-auto min-h-12 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5"
          >
            <Swords size={16} />
            <span>Quick Match (10 Min)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeroBanner;
