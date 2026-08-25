import { PlaySquare } from 'lucide-react';
import { type AdminActiveGameResponseDTO } from '../../../api/adminService';

interface ActiveGamesPanelProps {
    activeGames: AdminActiveGameResponseDTO[];
    loading: boolean;
    onForceFinish: (gameId: string) => void;
}

export default function ActiveGamesPanel({ activeGames, loading, onForceFinish }: ActiveGamesPanelProps) {
    return (
        <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                <PlaySquare size={20} /> Active Game Sessions ({activeGames.length})
            </h2>
            {loading ? (
                <p className="text-sm text-slate-500">Loading...</p>
            ) : activeGames.length === 0 ? (
                <p className="text-sm text-slate-500">No active game sessions found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                       <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="py-3 px-4">Game ID</th>
                                <th className="py-3 px-4">White Player</th>
                                <th className="py-3 px-4">Black Player</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                            {activeGames.map((game: AdminActiveGameResponseDTO) => {
                                const whiteDisplay = game.whitePlayerId ? `User #${game.whitePlayerId}` : 'N/A';
                                const blackDisplay = game.blackPlayerId ? `User #${game.blackPlayerId}` : 'N/A';

                                return (
                                    <tr key={game.gameId} className="hover:bg-slate-100 dark:hover:bg-slate-800/20">
                                        <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">{game.gameId}</td>
                                        <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{whiteDisplay}</td>
                                        <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{blackDisplay}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">
                                                {game.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button 
                                                onClick={() => onForceFinish(game.gameId)}
                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                            >
                                                Force Finish
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
