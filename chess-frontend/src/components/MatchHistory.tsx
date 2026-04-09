import React, { useEffect, useState } from 'react';
import { getPlayerHistory } from '../api/gameService';
import { Trophy, Calendar, User, Activity } from 'lucide-react';

interface GameHistory {
    id: number;
    whitePlayerId: number;
    whitePlayerName: string;
    blackPlayerId: number;
    blackPlayerName: string;
    result: string;
    finishMethod: string;
    playedAt: string;
    whiteEloGain: number;
    blackEloGain: number;
}

const MatchHistory = ({ userId }: { userId: number }) => {
    const [history, setHistory] = useState<GameHistory[]>([]);

    useEffect(() => {
        if (userId) {
            getPlayerHistory(userId)
                .then((data) => setHistory(Array.isArray(data) ? data : []))
                .catch(console.error);
        }
    }, [userId]);

    return (
        <div className="w-full">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6 flex items-center gap-2">
                <Activity size={14} />
                Recent Matches
            </h2>
            
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-[8px] font-black uppercase tracking-widest opacity-40">
                            <th className="py-2 px-4">Opponent</th>
                            <th className="py-2 px-4">Result</th>
                            <th className="py-2 px-4">Method</th>
                            <th className="py-2 px-4 text-center">ELO</th>
                            <th className="py-2 px-4 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="text-[10px] font-bold">
                        {history.length > 0 ? (
                            history.map((game) => {
                                const isWhite = game.whitePlayerId === userId;
                                const rawOpponentName = isWhite ? game.blackPlayerName : game.whitePlayerName;
                            
                                const opponentDisplay = (rawOpponentName && rawOpponentName.toLowerCase().includes("guest") === false) 
                                    ? rawOpponentName 
                                    : "Training Bot";

                                const eloChange = isWhite ? game.whiteEloGain : game.blackEloGain;
                                const userWon = (isWhite && game.result === 'WHITE_WIN') || 
                                                (!isWhite && game.result === 'BLACK_WIN');
                                const isDraw = game.result === 'DRAW';

                                return (
                                    <tr key={game.id} className="group bg-white dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all shadow-sm">
                                        <td className="py-4 px-4 rounded-l-2xl border-y border-l border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px]">
                                                    <User size={12} className="opacity-50" />
                                                </div>
                                                <span className="truncate max-w-[120px]">
                                                    {opponentDisplay}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 border-y border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                                                userWon ? 'text-emerald-500 bg-emerald-500/10' : 
                                                isDraw ? 'text-slate-400 bg-slate-400/10' : 'text-rose-500 bg-rose-500/10'
                                            }`}>
                                                {userWon ? 'VICTORY' : isDraw ? 'DRAW' : 'DEFEAT'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 border-y border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900 opacity-60">
                                            {game.finishMethod}
                                        </td>
                                        <td className="py-4 px-4 border-y border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900 text-center font-mono">
                                            <span className={eloChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                                                {eloChange > 0 ? `+${eloChange}` : eloChange}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 rounded-r-2xl border-y border-r border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900 text-right opacity-40">
                                            {new Date(game.playedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-12 text-center opacity-30 italic text-[11px] tracking-widest">
                                    No matches recorded in history.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MatchHistory;
