import React, { useEffect, useState, useCallback } from 'react';
import { getUserStats, getPlayerHistory } from '../api/gameService';
import { Trophy, Swords, User, TrendingUp, History, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react';

interface Stats {
    username: string;
    elo: number;
    wins: number;
    losses: number;
    draws: number;
}

interface GameHistory {
    id: number;
    whitePlayerId: number;
    whitePlayerName: string;
    blackPlayerId: number;
    blackPlayerName: string;
    result: 'WHITE_WIN' | 'BLACK_WIN' | 'DRAW';
    finishMethod: string;
    playedAt: string;
}

const Dashboard = ({ userId, onRejoinGame }: { userId: number, onRejoinGame?: (id: string) => void }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [history, setHistory] = useState<GameHistory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadDashboardData = useCallback(async () => {
        if (!userId || isNaN(userId) || userId <= 0) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const [statsData, historyData] = await Promise.all([
                getUserStats(userId),
                getPlayerHistory(userId)
            ]);

            setStats(statsData);
            setHistory(Array.isArray(historyData) ? historyData : []);
        } catch (err: any) {
            console.error("Dashboard Sync Error:", err);
            const status = err.response?.status;
            setError(status === 403 ? "AUTH_DENIED" : status === 400 ? "BAD_REQUEST" : "SYNC_FAILED");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadDashboardData();
        const handleFocus = () => loadDashboardData();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [loadDashboardData]);

    if (isLoading && !stats) {
        return (
            <div className="p-8 text-center flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="opacity-40 uppercase text-[8px] font-black tracking-widest italic">Syncing Tactical Grid...</span>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="p-8 text-center flex flex-col items-center gap-2 text-rose-500">
                <AlertCircle size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                <button onClick={loadDashboardData} className="text-[9px] underline font-bold mt-2 hover:text-white">RE-ESTABLISH LINK</button>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="flex flex-col gap-3 p-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Command Center</h2>
                <button 
                    onClick={loadDashboardData} 
                    disabled={isLoading}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                >
                    <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : 'opacity-30 group-hover:opacity-100'} transition-opacity`} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                    { label: 'Agent', value: stats.username, icon: <User size={12} />, color: 'border-blue-500' },
                    { label: 'Tactical ELO', value: stats.elo, icon: <TrendingUp size={12} />, color: 'border-yellow-500' },
                    { label: 'Victories', value: stats.wins, icon: <Trophy size={12} />, color: 'border-emerald-500' },
                    { label: 'Defeats', value: stats.losses, icon: <Swords size={12} />, color: 'border-rose-500' }
                ].map((card, idx) => (
                    <div key={idx} className={`bg-slate-800/40 p-3 rounded-xl border-l-2 ${card.color} backdrop-blur-sm shadow-inner`}>
                        <div className="flex items-center gap-1 opacity-40 mb-1">
                            {card.icon}
                            <span className="text-[7px] font-black uppercase tracking-tighter">{card.label}</span>
                        </div>
                        <p className="text-sm font-black text-white truncate leading-none">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-800/20 rounded-2xl p-4 border border-white/5 shadow-xl">
                <div className="flex items-center gap-2 mb-4 opacity-20">
                    <History size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Combat Logs</span>
                </div>
                
                <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                    {history.length > 0 ? (
                        history.map((match, i) => {
                            const isWhite = match.whitePlayerId === userId;
                            const opponentName = isWhite ? match.blackPlayerName : match.whitePlayerName;
                            const result = match.result === (isWhite ? 'WHITE_WIN' : 'BLACK_WIN') 
                                ? 'WIN' 
                                : match.result === 'DRAW' ? 'DRAW' : 'LOSS';

                            return (
                                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-200">
                                            {opponentName || 'Guest'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black tracking-widest ${
                                                result === 'WIN' ? 'text-emerald-500' : result === 'LOSS' ? 'text-rose-500' : 'text-slate-400'
                                            }`}>
                                                {result}
                                            </span>
                                            <span className="text-[7px] opacity-20 font-bold uppercase tracking-tighter">
                                                {match.finishMethod}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onRejoinGame?.(match.id.toString())} 
                                        className="p-1.5 rounded-md bg-white/5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transition-all"
                                        title="Review Mission"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center opacity-20 text-[10px] font-bold uppercase tracking-widest">
                            No combat data recorded
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
