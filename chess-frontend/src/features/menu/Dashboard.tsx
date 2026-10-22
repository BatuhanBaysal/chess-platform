import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getMyProfile } from '../../api/userService';
import { Trophy, Swords, BarChart3, Activity, TrendingUp, Percent, Info } from 'lucide-react';
import ChessBoard from '../chess/components/ChessBoard.tsx';
import { useChess } from '../chess/hooks/useChess.ts';
import { MatchDistributionGraph } from '../../components/charts/MatchDistributionGraph';
import { Tooltip } from '../../components/ui/Tooltip';

interface Stats {
  username: string;
  eloRating: number | null;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
}

interface DashboardProps {
  userId: number;
  activeLobbyId?: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, activeLobbyId }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [theme] = useState<'classic' | 'modern' | 'emerald'>('classic');

  const { game, makeMove, fetchLegalMoves, resetChessState } = useChess();

  const loadDashboardData = useCallback(async () => {
    if (!userId) return; 

    try {
      const statsData = await getMyProfile();
      setStats(statsData);
    } catch (err: unknown) {
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
      { 
        label: 'ELO', 
        value: stats.eloRating ?? 'N/A', 
        icon: <TrendingUp size={13} />, 
        borderColor: 'border-yellow-500', 
        textColor: 'text-amber-600 dark:text-yellow-400',
        tooltip: 'Standard chess rating based on wins/losses against ranked players'
      },
      { 
        label: 'Wins', 
        value: stats.totalWins, 
        icon: <Trophy size={13} />, 
        borderColor: 'border-emerald-500', 
        textColor: 'text-emerald-700 dark:text-emerald-400',
        tooltip: 'Total victories in ranked multiplayer games'
      },
      { 
        label: 'Losses', 
        value: stats.totalLosses, 
        icon: <Swords size={13} />, 
        borderColor: 'border-rose-500', 
        textColor: 'text-rose-700 dark:text-rose-400',
        tooltip: 'Total defeats in ranked multiplayer games'
      },
      { 
        label: 'Draws', 
        value: stats.totalDraws, 
        icon: <Activity size={13} />, 
        borderColor: 'border-slate-300', 
        textColor: 'text-slate-800 dark:text-slate-400',
        tooltip: 'Matches ending in stalemate, agreement, or draw rules'
      }
    ];
  }, [stats]);

  const totalMatches = useMemo(() => {
    if (!stats) return 0;
    return stats.totalWins + stats.totalLosses + stats.totalDraws;
  }, [stats]);

  const winRate = useMemo(() => {
    if (totalMatches === 0 || !stats) return 0;
    return Math.round((stats.totalWins / totalMatches) * 100);
  }, [stats, totalMatches]);

  const matchData = useMemo(() => {
    if (!stats || totalMatches === 0) {
      return [{ name: 'No Data', value: 1, fill: '#334155' }];
    }

    return [
      { name: 'Wins', value: stats.totalWins, fill: '#10b981' },
      { name: 'Losses', value: stats.totalLosses, fill: '#f43f5e' },
      { name: 'Draws', value: stats.totalDraws, fill: '#64748b' }
    ];
  }, [stats, totalMatches]);

  if (game && activeLobbyId) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-full bg-white dark:bg-[#070b19] p-5 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className="text-indigo-600" size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-400">
              Live Match
            </span>
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
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* 4 Stats Cards */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statsCards.map((card, idx) => (
            <Tooltip key={idx} content={card.tooltip} position="top">
              <div 
                className={`w-full bg-slate-50 dark:bg-slate-900/60 p-3.5 sm:p-4 rounded-2xl border ${card.borderColor} dark:border-slate-800 shadow-xs cursor-help transition-colors`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={card.textColor}>{card.icon}</span>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-300">
                      {card.label}
                    </p>
                  </div>
                  <Info size={11} className="text-slate-400 opacity-60" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tabular-nums tracking-tight">
                  {card.value}
                </p>
              </div>
            </Tooltip>
          ))}
        </div>
      </section>

      {/* Rating Notice */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 shadow-xs">
        <TrendingUp size={14} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
        <p className="leading-relaxed font-medium">
          <span className="font-black text-slate-950 dark:text-white uppercase tracking-wider text-[10px] mr-1">
            Rating System:
          </span>
          Ranked PvP matches adjust your ELO rating based on outcome and opponent skill. AI matches do not affect ELO.
        </p>
      </div>

      {/* Match Distribution Card */}
      <section className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80 mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={16} />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 dark:text-white">
              MATCH DISTRIBUTION
            </h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-950 dark:text-indigo-300 shadow-xs">
            <Percent size={12} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-black tracking-wider">{winRate}% WIN RATE</span>
          </div>
        </div>

        {totalMatches > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 min-h-55 flex items-center justify-center relative">
              <MatchDistributionGraph data={matchData} />
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center space-y-3.5 pl-0 lg:pl-4">
              <div>
                <div className="flex justify-between text-xs font-black mb-1.5">
                  <span className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-extrabold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 shrink-0" />
                    Victories
                  </span>
                  <span className="text-slate-950 dark:text-white font-mono font-black">
                    {stats?.totalWins} <span className="text-slate-700 dark:text-slate-400 text-[10px]">({Math.round(((stats?.totalWins || 0) / totalMatches) * 100)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${((stats?.totalWins || 0) / totalMatches) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-black mb-1.5">
                  <span className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-extrabold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 dark:bg-rose-500 shrink-0" />
                    Defeats
                  </span>
                  <span className="text-slate-950 dark:text-white font-mono font-black">
                    {stats?.totalLosses} <span className="text-slate-700 dark:text-slate-400 text-[10px]">({Math.round(((stats?.totalLosses || 0) / totalMatches) * 100)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-600 dark:bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${((stats?.totalLosses || 0) / totalMatches) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-black mb-1.5">
                  <span className="flex items-center gap-2 text-slate-900 dark:text-slate-300 font-extrabold">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600 dark:bg-slate-500 shrink-0" />
                    Draws
                  </span>
                  <span className="text-slate-950 dark:text-white font-mono font-black">
                    {stats?.totalDraws} <span className="text-slate-700 dark:text-slate-400 text-[10px]">({Math.round(((stats?.totalDraws || 0) / totalMatches) * 100)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-600 dark:bg-slate-500 rounded-full transition-all duration-500"
                    style={{ width: `${((stats?.totalDraws || 0) / totalMatches) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
            <Activity size={26} className="opacity-40" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">
              No Match Data Yet
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
