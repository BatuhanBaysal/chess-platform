import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { LogEntry } from '../types/chess.types';

interface TelemetrySidebarProps {
    logs: LogEntry[];
}

export const TelemetrySidebar: React.FC<TelemetrySidebarProps> = ({ logs }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollStartRef = useRef<HTMLDivElement>(null);
    const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

    const uniqueLogs = useMemo(() => {
        const seen = new Set();
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
        if (!isUserScrolledUp) {
            scrollStartRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [uniqueLogs.length, isUserScrolledUp]);

    return (
        <div className="w-full h-full bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex flex-col overflow-hidden shadow-inner">
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll min-h-0 relative"
            >
                <div ref={scrollStartRef} />
                
                {uniqueLogs.map((log) => {
                    const uniqueKey = `log-${log.time}-${log.text}`;

                    return (
                        <div 
                            key={uniqueKey} 
                            className={`text-[11px] p-2.5 rounded-xl border-l-2 ${log.text.includes("Game started") ? "border-emerald-500 bg-emerald-500/5" : log.turn === 'WHITE' ? "border-blue-500 bg-blue-500/5" : "border-rose-500 bg-rose-500/5"}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400">{log.time}</span>
                                {!log.text.includes("Game started") && (
                                    <span className={`text-[9px] font-black uppercase ${log.turn === 'WHITE' ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}`}>
                                        {log.turn}
                                    </span>
                                )}
                            </div>
                            <span className={`font-bold leading-tight block text-slate-900 dark:text-slate-100 ${log.text.includes("Game started") ? "dark:text-emerald-400" : ""}`}>
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
