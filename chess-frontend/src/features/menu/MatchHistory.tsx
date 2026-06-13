import { useEffect, useState } from 'react';
import { getPlayerHistory } from '../../api/gameService';
import { User, Activity, Sword, Hash } from 'lucide-react';

interface GameHistory {
    id: number;
    whitePlayerId: number;
    whitePlayerName: string;
    blackPlayerId: number;
    blackPlayerName: string;
    result: 'WHITE_WIN' | 'BLACK_WIN' | 'DRAW';
    finishMethod: string;
    playedAt: string;
    whiteEloGain: number;
    blackEloGain: number;
}

const MatchHistory = ({ userId }: { userId: number }) => {
    const [history, setHistory] = useState<GameHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        setIsLoading(true);
        getPlayerHistory(userId)
            .then((data) => {
                const normalizedData = Array.isArray(data) 
                    ? data.map(item => ({
                        ...item,
                        result: item.result?.toString() as any,
                        finishMethod: item.finishMethod?.toString() || 'UNKNOWN'
                    })) 
                    : [];
                setHistory(normalizedData);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [userId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
        });
    };

    return (
        <div className="w-full animate-in fade-in duration-500 text-slate-900 dark:text-white">
            <div className="flex justify-between items-end mb-6 px-1">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-500 flex items-center gap-2">
                    <Activity size={16} className="animate-pulse" />
                    Deployment History
                </h2>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    {history.length} Matches Logged
                </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar rounded-3xl">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest opacity-40">
                            <th className="py-3 px-6">Opponent</th>
                            <th className="py-3 px-4">Outcome</th>
                            <th className="py-3 px-4">Tactical End</th>
                            <th className="py-3 px-6 text-right">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-bold">
                        {history.length > 0 ? (
                            history.map((game) => {
                                const isWhite = game.whitePlayerId === userId;
                                const rawOpponentName = isWhite ? game.blackPlayerName : game.whitePlayerName;
                                const isGuest = !rawOpponentName || rawOpponentName.toLowerCase().includes("guest");
                                const opponentDisplay = isGuest ? "Training Bot v1.0" : rawOpponentName;

                                const isDraw = game.result === 'DRAW';
                                const userWon = (isWhite && game.result === 'WHITE_WIN') || (!isWhite && game.result === 'BLACK_WIN');

                                return (
                                    <tr key={game.id} className="group bg-slate-100 dark:bg-slate-900/20 hover:bg-blue-100 dark:hover:bg-blue-500/5 transition-all duration-300 shadow-sm border border-slate-200 dark:border-white/5">
                                        <td className="py-4 px-6 rounded-l-3xl border-y border-l border-slate-200 dark:border-white/5 group-hover:border-blue-300 dark:group-hover:border-blue-500/30">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-9 h-9 rounded-2xl ${isGuest ? 'bg-slate-200 dark:bg-slate-800' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'} flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-inner`}>
                                                    {isGuest ? <Hash size={16} className="opacity-40" /> : <User size={16} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 dark:text-slate-200 tracking-tight truncate max-w-35">
                                                        {opponentDisplay}
                                                    </span>
                                                    <span className="text-[9px] text-slate-500 uppercase font-black">
                                                        {isWhite ? 'White Alliance' : 'Black Alliance'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 border-y border-slate-200 dark:border-white/5 group-hover:border-blue-300 dark:group-hover:border-blue-500/30">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${userWon ? 'bg-emerald-500' : isDraw ? 'bg-slate-500' : 'bg-rose-500'}`}></div>
                                                <span className={`text-[11px] font-black uppercase tracking-widest ${
                                                    userWon ? 'text-emerald-600 dark:text-emerald-500' : isDraw ? 'text-slate-500' : 'text-rose-600 dark:text-rose-500'
                                                }`}>
                                                    {userWon ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 border-y border-slate-200 dark:border-white/5 group-hover:border-blue-300 dark:group-hover:border-blue-500/30 opacity-70 font-medium">
                                            <span className="capitalize">{game.finishMethod.toLowerCase().replace('_', ' ')}</span>
                                        </td>
                                        <td className="py-4 px-6 rounded-r-3xl border-y border-r border-slate-200 dark:border-white/5 group-hover:border-blue-300 dark:group-hover:border-blue-500/30 text-right font-mono opacity-50 text-[10px]">
                                            {formatDate(game.playedAt)}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : isLoading ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <div className="inline-block w-8 h-8 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin opacity-40"></div>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-20 text-center opacity-40 flex flex-col items-center gap-4">
                                    <Sword size={48} />
                                    <span className="italic text-xs font-black uppercase tracking-[0.4em]">No combat data in archives</span>
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
