import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getUserStats, getPlayerHistory } from '../../api/gameService';
import { Trophy, Swords, User, TrendingUp, History, RefreshCw, Loader2, LayoutDashboard, AlertCircle } from 'lucide-react';
import ChessBoard from '../../components/chess/ChessBoard';
import { useChess } from '../../hooks/useChess';

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
        isLobbyConnected,
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
            const normalizedHistory = Array.isArray(historyData) 
                ? historyData.map(item => ({
                    ...item,
                    result: item.result?.toString() as any,
                    finishMethod: item.finishMethod?.toString() || 'UNKNOWN'
                })) 
                : [];
            setHistory(normalizedHistory);
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
    
    return () => {
        if (game?.status === 'CHECKMATE' || game?.status === 'DRAW') {
        }
        
        resetChessState();
    };
}, [activeLobbyId, startNewGame, resetChessState, game?.status, game?.gameId]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const statsCards = useMemo(() => {
        if (!stats) return [];

        return [
            { label: 'Agent', value: stats.username, icon: <User size={12} />, color: 'border-blue-500' },
            { label: 'ELO', value: stats.elo, icon: <TrendingUp size={12} />, color: 'border-yellow-500' },
            { label: 'Wins', value: stats.wins, icon: <Trophy size={12} />, color: 'border-emerald-500' },
            { label: 'Losses', value: stats.losses, icon: <Swords size={12} />, color: 'border-rose-500' }
        ];
    }, [stats]);

    if (game && activeLobbyId) {
        return (
            <div className="flex flex-col items-center gap-6 p-4">
                <div className="w-full flex justify-between items-center mb-4 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="text-blue-600 dark:text-blue-500" size={20} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Deployment</span>
                            <span className={`text-[10px] font-bold uppercase ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isConnected ? 'Link Stable' : 'Link Interrupted'}
                            </span>
                        </div>
                    </div>
                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as any)}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-none focus:ring-2 ring-blue-500 outline-none cursor-pointer"
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
            <div className="p-12 text-center flex flex-col items-center gap-4 justify-center min-h-75">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
                <span className="opacity-60 uppercase text-[10px] font-black tracking-[0.2em] animate-pulse italic text-slate-500">Syncing...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isLobbyConnected || isConnected ? 'bg-blue-600' : 'bg-rose-500'}`}></div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Command Center</h2>
                </div>
                <button onClick={loadDashboardData} disabled={isLoading} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Error Syncing</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {statsCards.map((card, idx) => (
                    <div key={idx} className={`bg-white dark:bg-slate-900/40 p-4 rounded-2xl border-l-4 ${card.color} border shadow-sm`}>
                        <div className="flex items-center gap-2 opacity-50 mb-1">
                            {card.icon}
                            <span className="text-[8px] font-black uppercase tracking-widest truncate">{card.label}</span>
                        </div>
                        <p className="text-sm font-black truncate">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2 mb-6 opacity-40">
                    <History size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Combat Logs</span>
                </div>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {history.length > 0 ? history.map((match, i) => {
                        const isWhite = match.whitePlayerId === userId;
                        const isDraw = match.result === 'DRAW';
                        const userWon = (isWhite && match.result === 'WHITE_WIN') || (!isWhite && match.result === 'BLACK_WIN');

                        return (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-transparent">
                                <div>
                                    <p className="text-[10px] font-black uppercase truncate max-w-30">vs {isWhite ? match.blackPlayerName : match.whitePlayerName}</p>
                                    <p className={`text-[8px] font-black ${
                                        userWon ? 'text-emerald-500' : 
                                        isDraw ? 'text-slate-500' : 'text-rose-500'
                                    }`}>
                                        {userWon ? 'WIN' : isDraw ? 'DRAW' : 'LOSS'}
                                    </p>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-8 text-center opacity-30 text-[10px] font-black uppercase">No Data</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
