import { useRef, useEffect, useState, useMemo } from 'react';
import type { LogEntry } from '../types/chess.types';

interface TelemetrySidebarProps {
  readonly logs: LogEntry[];
}

const getLogCardStyle = (isGameStart: boolean, turn?: string): string => {
  if (isGameStart) {
    return "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15";
  }
  if (turn === 'WHITE') {
    return "border-blue-500 bg-blue-500/10 dark:bg-blue-500/15";
  }
  return "border-rose-500 bg-rose-500/10 dark:bg-rose-500/15";
};

export const TelemetrySidebar = ({ logs }: Readonly<TelemetrySidebarProps>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  const uniqueLogs = useMemo(() => {
    const seen = new Set<string>();
    return logs.filter(log => {
      const identifier = `${log.time}-${log.text}`;
      if (seen.has(identifier)) {
        return false;
      }
      seen.add(identifier);
      return true;
    });
  }, [logs]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop } = scrollContainerRef.current;
    setIsUserScrolledUp(scrollTop > 30);
  };

  useEffect(() => {
    if (!isUserScrolledUp && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [uniqueLogs.length, isUserScrolledUp]);

  return (
    <div className="w-full h-full bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col overflow-hidden shadow-xs">
      {/* Telemetry Stream Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll min-h-0 relative"
      >
        {uniqueLogs.map((log) => {
          const uniqueKey = `log-${log.time}-${log.text}`;
          const isGameStart = log.text.includes("Game started");
          const cardStyle = getLogCardStyle(isGameStart, log.turn);

          return (
            <div 
              key={uniqueKey} 
              className={`text-[11px] p-2.5 rounded-xl border-l-2 ${cardStyle}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400">{log.time}</span>
                {!isGameStart && (
                  <span className={`text-[9px] font-black uppercase ${log.turn === 'WHITE' ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {log.turn}
                  </span>
                )}
              </div>
              <span className={`font-bold leading-tight block text-slate-950 dark:text-slate-100 ${isGameStart ? "text-emerald-700 dark:text-emerald-400" : ""}`}>
                {log.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TelemetrySidebar;
