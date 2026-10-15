import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard, type LeaderboardUser } from '../../../api/userService';
import { Trophy, ChevronRight } from 'lucide-react';

export const GlobalLeaderboard: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getLeaderboard()
            .then(setUsers)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const handleViewAllClick = () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        navigate('/leaderboard');
    };

    const getTrophyColor = (index: number) => {
        if (index === 0) return 'text-amber-500 drop-shadow-sm';
        if (index === 1) return 'text-slate-500 dark:text-slate-300 drop-shadow-sm';
        return 'text-amber-700 dark:text-amber-600 drop-shadow-sm';
    };

    return (
        <div className="w-full h-full flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black uppercase tracking-wider text-slate-950 dark:text-white flex items-center gap-2.5">
                    <Trophy size={20} className="text-indigo-600 dark:text-indigo-400" />
                    <span>TOP PLAYERS</span>
                </h2>
                <button 
                    onClick={handleViewAllClick} 
                    className="min-h-11 px-2 flex items-center text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                    <span>VIEW ALL</span>
                    <ChevronRight size={14} className="ml-0.5" />
                </button>
            </div>
            
            {/* List */}
            {isLoading ? (
                <div className="py-16 text-center text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Syncing rankings...
                </div>
            ) : users.length === 0 ? (
                <div className="py-16 text-center text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    No active players found.
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-4 py-1">
                    {users.slice(0, 3).map((user, index) => {
                        const userInitial = (user.username?.charAt(0) || 'U').toUpperCase();
                        return (
                            <div 
                                key={user.username} 
                                className="flex-1 min-h-18 sm:min-h-20 flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 transition-all shadow-xs"
                            >
                                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                                    <div className="flex items-center justify-center shrink-0">
                                        <Trophy size={22} className={getTrophyColor(index)} />
                                    </div>
                                    <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-xs">
                                        {userInitial}
                                    </div>
                                    <div className="min-w-0 flex flex-col">
                                        <span className="font-black text-base sm:text-lg text-slate-950 dark:text-white truncate">
                                            {user.username}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                                            {user.totalWins ?? 0}W / {user.totalLosses ?? 0}L / {user.totalDraws ?? 0}D
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="text-right shrink-0 pl-2">
                                    <p className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400 tabular-nums">
                                        {user.eloRating}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">
                                        ELO
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GlobalLeaderboard;
