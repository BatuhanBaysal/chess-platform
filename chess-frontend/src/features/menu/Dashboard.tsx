import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getMyProfile } from '../../api/userService';
import { Trophy, Swords, BarChart3, Activity, TrendingUp } from 'lucide-react';
import ChessBoard from '../../components/chess/ChessBoard';
import { useChess } from '../../hooks/useChess';
import { MatchDistributionGraph } from '../../components/charts/MatchDistributionGraph';

interface Stats {
    username: string;
    eloRating: number;
    totalWins: number;
    totalLosses: number;
    totalDraws: number;
}

interface DashboardProps {
    userId: number;
    activeLobbyId?: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, activeLobbyId }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [theme] = useState<'classic' | 'modern' | 'emerald'>('classic');

    const { game, makeMove, fetchLegalMoves, resetChessState } = useChess();

    const loadDashboardData = useCallback(async () => {
        if (!userId) return; 

        try {
            const statsData = await getMyProfile();
            setStats(statsData);
        } catch (err: any) {
            console.error("Dashboard data loading error:", err);
        }
    }, [userId]);

    useEffect(() => {
        const init = async () => {
            await loadDashboardData();
        };
        init();
        
        return () => {
            resetChessState();
        };
    }, [loadDashboardData, resetChessState]);

    const statsCards = useMemo(() => {
        if (!stats) return [];
        return [
            { label: 'ELO', value: stats.eloRating, icon: <TrendingUp size={12} />, color: 'yellow' },
            { label: 'Wins', value: stats.totalWins, icon: <Trophy size={12} />, color: 'emerald' },
            { label: 'Losses', value: stats.totalLosses, icon: <Swords size={12} />, color: 'rose' },
            { label: 'Draws', value: stats.totalDraws, icon: <Activity size={12} />, color: 'slate' }
        ];
    }, [stats]);

    const matchData = useMemo(() => {
        if (!stats) return [];
        const total = stats.totalWins + stats.totalLosses + stats.totalDraws;
        if (total === 0) {
            return [{ name: 'No Data', value: 1, fill: '#334155' }];
        }

        return [
            { name: 'Wins', value: stats.totalWins, fill: '#10b981' },
            { name: 'Losses', value: stats.totalLosses, fill: '#f43f5e' },
            { name: 'Draws', value: stats.totalDraws, fill: '#64748b' }
        ];
    }, [stats]);

    if (game && activeLobbyId) {
        return (
            <div className="flex flex-col items-center gap-6 p-4">
                <div className="w-full bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Activity className="text-blue-600" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Deployment</span>
                    </div>
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
                    orientation={'WHITE'}
                    theme={theme}
                    timeLimit={10}
                    onBackToMenu={() => resetChessState()}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-6">
            <section>
                <div className="grid grid-cols-2 gap-3">
                    {statsCards.map((card, idx) => (
                        <div 
                            key={idx} 
                            className={`bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border-l-4 border-${card.color}-500 border-t border-r border-b border-slate-200 dark:border-slate-800 shadow-sm`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-${card.color}-500`}>{card.icon}</span>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    {card.label}
                                </p>
                            </div>
                            <p className="text-lg font-black text-slate-900 dark:text-white">{card.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="text-blue-500" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Match Distribution</span>
                </div>
                <div className="h-50 w-full flex items-center justify-center">
                    {stats && (stats.totalWins + stats.totalLosses + stats.totalDraws > 0) ? (
                        <MatchDistributionGraph data={matchData} />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Activity size={24} className="opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-widest">No Match Data Yet</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
