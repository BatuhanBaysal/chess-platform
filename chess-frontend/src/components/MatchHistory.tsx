import { useEffect, useState } from 'react';
import { getPlayerHistory } from '../api/gameService';
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
            .then((data) => setHistory(Array.isArray(data) ? data : []))
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
        <div className="w-full animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 flex items-center gap-2">
                    <Activity size={14} className="animate-pulse" />
                    Deployment History
                </h2>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                    {history.length} Matches Logged
                </span>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar rounded-2xl">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-[8px] font-black uppercase tracking-widest opacity-30">
                            <th className="py-2 px-6">Opponent</th>
                            <th className="py-2 px-4">Outcome</th>
                            <th className="py-2 px-4">Tactical End</th>
                            <th className="py-2 px-4 text-center">Δ ELO</th>
                            <th className="py-2 px-6 text-right">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="text-[10px] font-bold">
                        {history.length > 0 ? (
                            history.map((game) => {
                                const isWhite = game.whitePlayerId === userId;
                                const rawOpponentName = isWhite ? game.blackPlayerName : game.whitePlayerName;
                                
                                const isGuest = !rawOpponentName || rawOpponentName.toLowerCase().includes("guest");
                                const opponentDisplay = isGuest ? "Training Bot v1.0" : rawOpponentName;

                                const eloChange = isWhite ? game.whiteEloGain : game.blackEloGain;
                                const userWon = (isWhite && game.result === 'WHITE_WIN') || 
                                                (!isWhite && game.result === 'BLACK_WIN');
                                const isDraw = game.result === 'DRAW';

                                return (
                                    <tr key={game.id} className="group bg-slate-900/20 hover:bg-blue-500/5 transition-all duration-300 shadow-sm border border-white/5">
                                        <td className="py-4 px-6 rounded-l-2xl border-y border-l border-white/5 group-hover:border-blue-500/30">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 rounded-lg ${isGuest ? 'bg-slate-800' : 'bg-blue-500/10 text-blue-400'} flex items-center justify-center border border-white/5 shadow-inner`}>
                                                    {isGuest ? <Hash size={12} className="opacity-40" /> : <User size={12} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-200 tracking-tight truncate max-w-[140px]">
                                                        {opponentDisplay}
                                                    </span>
                                                    <span className="text-[7px] text-slate-500 uppercase font-black">
                                                        {isWhite ? 'White Alliance' : 'Black Alliance'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 border-y border-white/5 group-hover:border-blue-500/30">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${userWon ? 'bg-emerald-500' : isDraw ? 'bg-slate-500' : 'bg-rose-500'}`}></div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${
                                                    userWon ? 'text-emerald-500' : isDraw ? 'text-slate-400' : 'text-rose-500'
                                                }`}>
                                                    {userWon ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 border-y border-white/5 group-hover:border-blue-500/30 opacity-60 font-medium">
                                            <span className="capitalize">{game.finishMethod.toLowerCase().replace('_', ' ')}</span>
                                        </td>

                                        <td className="py-4 px-4 border-y border-white/5 group-hover:border-blue-500/30 text-center font-mono">
                                            <div className={`inline-block px-2 py-0.5 rounded-md ${
                                                eloChange > 0 ? 'bg-emerald-500/10 text-emerald-500' : 
                                                eloChange < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-500'
                                            }`}>
                                                {eloChange > 0 ? `+${eloChange}` : eloChange}
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 rounded-r-2xl border-y border-r border-white/5 group-hover:border-blue-500/30 text-right font-mono opacity-40 text-[9px]">
                                            {formatDate(game.playedAt)}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin opacity-20"></div>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center opacity-20 flex flex-col items-center gap-3">
                                    <Sword size={32} />
                                    <span className="italic text-[11px] font-black uppercase tracking-[0.4em]">No combat data in archives</span>
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
