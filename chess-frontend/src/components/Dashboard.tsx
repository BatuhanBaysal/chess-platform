import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getUserStats, getPlayerHistory, getLobbyStatus } from '../api/gameService'; 
import { Trophy, Swords, User, TrendingUp, History, RefreshCw, ChevronRight, AlertCircle, Loader2, LayoutDashboard } from 'lucide-react';
import ChessBoard from './ChessBoard'; 
import { useChess } from '../hooks/useChess'; 

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

interface DashboardProps {
    userId: number;
    activeLobbyId?: string | null; 
}

const Dashboard: React.FC<DashboardProps> = ({ userId, activeLobbyId }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [history, setHistory] = useState<GameHistory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<'classic' | 'modern' | 'emerald'>('classic');

    const { 
        game, 
        isConnected, 
        playerColor, 
        makeMove, 
        fetchLegalMoves, 
        startNewGame, 
        resetChessState 
    } = useChess();

    const loadDashboardData = useCallback(async () => {
        if (!userId || typeof userId !== 'number' || userId <= 0) return;
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
            setError(err.response?.status === 403 ? "AUTH_DENIED" : "SYNC_FAILED");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (activeLobbyId) {
            startNewGame(activeLobbyId);
        }
        return () => resetChessState();
    }, [activeLobbyId, startNewGame, resetChessState]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const statsCards = useMemo(() => {
        if (!stats) return [];
        return [
            { label: 'Agent', value: stats.username, icon: <User size={12} />, color: 'border-blue-500' },
            { label: 'Tactical ELO', value: stats.elo, icon: <TrendingUp size={12} />, color: 'border-yellow-500' },
            { label: 'Victories', value: stats.wins, icon: <Trophy size={12} />, color: 'border-emerald-500' },
            { label: 'Defeats', value: stats.losses, icon: <Swords size={12} />, color: 'border-rose-500' }
        ];
    }, [stats]);

    if (game && activeLobbyId) {
        return (
            <div className="flex flex-col items-center gap-6 p-4">
                <div className="w-full max-w-[1200px] flex justify-between items-center mb-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="text-blue-500" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Deployment</span>
                    </div>
                    <select 
                        value={theme} 
                        onChange={(e) => setTheme(e.target.value as any)}
                        className="bg-slate-800 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-none focus:ring-2 ring-blue-500 outline-none cursor-pointer"
                    >
                        <option value="classic">Classic</option>
                        <option value="modern">Modern</option>
                        <option value="emerald">Emerald</option>
                    </select>
                </div>

                <ChessBoard
                    boardRepresentation={game.boardRepresentation}
                    isStarted={game.isStarted}
                    gameStatus={game.status}
                    currentTurn={game.currentTurn}
                    moveHistory={game.moveHistory}
                    lastMoveMessage={game.lastMoveMessage}
                    onMove={(f, r, tf, tr, prom) => makeMove(activeLobbyId, f, r, tf, tr, prom)}
                    fetchLegalMoves={fetchLegalMoves}
                    theme={theme}
                    timeLimit={10}
                    orientation={playerColor || 'WHITE'}
                    onBackToMenu={() => resetChessState()}
                />
            </div>
        );
    }

    if (isLoading && !stats) {
        return (
            <div className="p-12 text-center flex flex-col items-center gap-4 justify-center min-h-[300px]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <span className="opacity-40 uppercase text-[9px] font-black tracking-[0.3em] animate-pulse italic">Syncing Tactical Grid...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Command Center</h2>
                </div>
                <button onClick={loadDashboardData} disabled={isLoading} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                    <RefreshCw size={14} className={`${isLoading ? 'animate-spin text-blue-400' : 'text-slate-500 hover:text-white'}`} />
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statsCards.map((card, idx) => (
                    <div key={idx} className={`bg-slate-900/40 p-4 rounded-2xl border-l-2 ${card.color} backdrop-blur-md border border-white/5`}>
                        <div className="flex items-center gap-2 opacity-40 mb-2">
                            {card.icon}
                            <span className="text-[8px] font-black uppercase tracking-widest">{card.label}</span>
                        </div>
                        <p className="text-lg font-black text-white truncate leading-tight tracking-tight">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/40 rounded-[2rem] p-6 border border-white/5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-5 px-1">
                    <div className="flex items-center gap-2 opacity-30">
                        <History size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em]">Combat Logs</span>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {history.length > 0 ? (
                        history.map((match, i) => {
                            const isWhite = match.whitePlayerId === userId;
                            const opponentName = isWhite ? match.blackPlayerName : match.whitePlayerName;
                            const result = match.result === 'DRAW' ? 'DRAW' : 
                                         (match.result === (isWhite ? 'WHITE_WIN' : 'BLACK_WIN') ? 'WIN' : 'LOSS');

                            return (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-transparent hover:border-white/10 transition-all group">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-slate-100 uppercase italic">vs {opponentName}</span>
                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-bold uppercase">{isWhite ? 'White' : 'Black'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-black tracking-widest ${result === 'WIN' ? 'text-emerald-400' : result === 'LOSS' ? 'text-rose-400' : 'text-slate-400'}`}>{result}</span>
                                            <span className="text-[8px] text-slate-500 font-bold uppercase">{match.finishMethod}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center opacity-10 flex flex-col items-center gap-2">
                            <Swords size={32} />
                            <span className="text-[10px] font-black uppercase">No Data Recorded</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
