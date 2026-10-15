import React, { useRef, useEffect } from 'react';
import type { MovePair } from '../types/chess.types';

interface NotationSidebarProps {
  pairedMoves: MovePair[];
}

export const NotationSidebar: React.FC<NotationSidebarProps> = ({ pairedMoves }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
    <div className="w-full h-full bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden flex flex-col shadow-xs">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scroll min-h-0 relative">
        <table className="w-full text-[12px] border-separate border-spacing-0">
          <thead className="sticky top-0 bg-slate-100 dark:bg-[#070b19] z-10 shadow-xs">
            <tr className="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <th className="py-2.5 px-3 text-left font-black w-10 italic opacity-50">#</th>
              <th className="py-2.5 px-3 text-left font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">White</th>
              <th className="py-2.5 px-3 text-left font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Black</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {pairedMoves.map((pair) => (
              <tr key={pair.index} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="py-2 px-3 text-slate-400 dark:text-slate-500 font-bold italic">{pair.index}.</td>
                <td className="py-2 px-3 text-slate-950 dark:text-slate-100 font-black">
                  {pair.white}
                  {getQualityBadge(pair.whiteQuality)}
                </td>
                <td className="py-2 px-3">
                  {pair.black ? (
                    <span className="text-slate-950 dark:text-slate-100 font-black">
                      {pair.black}
                      {getQualityBadge(pair.blackQuality)}
                    </span>
                  ) : (
                    <span className="opacity-20 italic">...</span>
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
