import { Swords, Loader2 } from 'lucide-react';
import { type AdminActiveGameResponseDTO } from '../../../api/adminService';

interface ActiveGamesPanelProps {
    activeGames: AdminActiveGameResponseDTO[];
    loading: boolean;
    onForceFinish: (gameId: string) => void;
}

export default function ActiveGamesPanel({ activeGames, loading, onForceFinish }: ActiveGamesPanelProps) {
    return (
        <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Swords size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white">
                    Live Match Sessions ({activeGames.length})
                </h2>
            </div>

            {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin text-emerald-600" size={24} />
                    <span className="text-xs font-black uppercase tracking-widest">Polling Sessions...</span>
                </div>
            ) : activeGames.length === 0 ? (
                <p className="text-xs font-bold text-slate-500 py-10 text-center uppercase tracking-wider">
                    No active matchmaking sessions currently deployed.
                </p>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80">
                    <table className="w-full text-left text-xs border-collapse table-fixed sm:table-auto">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/90 uppercase font-black tracking-wider text-[10px]">
                                <th className="hidden sm:table-cell py-3 px-4">Session ID</th>
                                <th className="py-3 px-3 sm:px-4">Matchup</th>
                                <th className="hidden md:table-cell py-3 px-4">State</th>
                                <th className="py-3 px-3 sm:px-4 text-right w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-bold">
                            {activeGames.map((game: AdminActiveGameResponseDTO) => {
                                const whiteDisplay = game.whitePlayerId ? `User #${game.whitePlayerId}` : 'Stockfish AI';
                                const blackDisplay = game.blackPlayerId ? `User #${game.blackPlayerId}` : 'Stockfish AI';

                                return (
                                    <tr key={game.gameId} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="hidden sm:table-cell py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400 font-black">
                                            {game.gameId}
                                        </td>
                                        <td className="py-3 px-3 sm:px-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-950 dark:text-white font-black truncate">{whiteDisplay} (W)</span>
                                                <span className="text-slate-500 text-[10px] truncate">vs {blackDisplay} (B)</span>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell py-3 px-4">
                                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-md text-[10px] font-black uppercase">
                                                {game.status || 'IN_PROGRESS'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 sm:px-4 text-right">
                                            <button 
                                                onClick={() => onForceFinish(game.gameId)}
                                                className="min-h-9 px-2.5 sm:px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                                            >
                                                Terminate
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
