import React, { useRef, useEffect } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import type { MovePair } from '../types/chess.types';

interface NotationSidebarProps {
  pairedMoves: MovePair[];
}

export const NotationSidebar: React.FC<NotationSidebarProps> = ({ pairedMoves }) => {
  const scrollStartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pairedMoves]);

  const getQualityBadge = (quality?: string) => {
    switch (quality) {
      case 'BLUNDER': return <span className="ml-1.5 text-[9px] bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded font-bold" title="Blunder">??</span>;
      case 'MISTAKE': return <span className="ml-1.5 text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-bold" title="?">?</span>;
      case 'INACCURACY': return <span className="ml-1.5 text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-bold" title="?!">?!</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden flex flex-col shadow-inner">
      <div className="bg-slate-200/50 dark:bg-slate-800/50 p-3 border-b border-slate-200 dark:border-slate-700/50 flex items-center gap-2 flex-none">
        <HistoryIcon size={14} className="text-indigo-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">Notation</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scroll min-h-0 relative">
        <div ref={scrollStartRef} />

        <table className="w-full text-[12px] border-separate border-spacing-0">
          <thead className="sticky top-0 bg-slate-200 dark:bg-[#0f172a] z-10">
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <th className="py-2.5 px-3 text-left font-black w-10 italic opacity-40">#</th>
              <th className="py-2.5 px-3 text-left font-black uppercase tracking-tighter text-blue-500">White</th>
              <th className="py-2.5 px-3 text-left font-black uppercase tracking-tighter text-rose-500">Black</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {pairedMoves.map((pair) => (
              <tr key={pair.index} className="border-b border-slate-200/50 dark:border-slate-800/30 hover:bg-slate-200/30 dark:hover:bg-white/5 transition-colors">
                <td className="py-2 px-3 text-slate-400 dark:text-slate-600 font-bold italic">{pair.index}.</td>
                <td className="py-2 px-3 text-blue-700 dark:text-blue-300 font-black">
                  {pair.white}
                  {getQualityBadge(pair.whiteQuality)}
                </td>
                <td className="py-2 px-3">
                  {pair.black ? (
                    <span className="text-rose-700 dark:text-rose-300 font-black">
                      {pair.black}
                      {getQualityBadge(pair.blackQuality)}
                    </span>
                  ) : (
                    <span className="opacity-10 italic">...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotationSidebar;
