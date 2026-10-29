import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard, type LeaderboardUser } from '../../../api/userService';
import { Trophy, ChevronRight } from 'lucide-react';
import { getFullAvatarUrl } from '../../../utils/avatarUtils';

const getPodiumConfig = (index: number) => {
    if (index === 0) {
        return {
            card: 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-400 shadow-sm shadow-amber-500/10',
            trophy: 'text-amber-500 dark:text-amber-400 drop-shadow-md',
            badge: 'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950',
            label: '1',
            tooltipText: '1st Place • Gold Medal'
        };
    }
    if (index === 1) {
        return {
            card: 'border-slate-400 bg-slate-100 dark:bg-slate-400/10 dark:border-slate-400 shadow-sm shadow-slate-500/10',
            trophy: 'text-slate-600 dark:text-slate-300 drop-shadow-md',
            badge: 'bg-slate-500 text-white dark:bg-slate-300 dark:text-slate-950',
            label: '2',
            tooltipText: '2nd Place • Silver Medal'
        };
    }
    return {
        card: 'border-amber-700 bg-amber-100/70 dark:bg-amber-900/20 dark:border-amber-600 shadow-sm shadow-amber-900/10',
        trophy: 'text-amber-800 dark:text-amber-500 drop-shadow-md',
        badge: 'bg-amber-800 text-white dark:bg-amber-600 dark:text-white',
        label: '3',
        tooltipText: '3rd Place • Bronze Medal'
    };
};

export const GlobalLeaderboard = () => {
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
        void navigate('/leaderboard');
    };

    const renderLeaderboardContent = () => {
        if (isLoading) {
            return (
                <div className="py-16 text-center text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Syncing rankings...
                </div>
            );
        }

        if (users.length === 0) {
            return (
                <div className="py-16 text-center text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    No active players found.
                </div>
            );
        }

        return (
            <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-4 py-1">
                {users.slice(0, 3).map((user, index) => {
                    const userInitial = (user.username?.charAt(0) || 'U').toUpperCase();
                    const podium = getPodiumConfig(index);

                    return (
                        <div 
                            key={user.username} 
                            className={`group relative flex-1 min-h-18 sm:min-h-20 flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${podium.card}`}
                        >
                            {/* Tooltip */}
                            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 z-30 flex flex-col items-center">
                                <div className="px-2.5 py-1 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xl whitespace-nowrap border border-slate-800 dark:border-slate-200">
                                    {podium.tooltipText}
                                </div>
                                <div className="w-2 h-1 border-t-4 border-t-slate-950 dark:border-t-white border-x-4 border-x-transparent" />
                            </div>

                            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                                <div className="relative flex items-center justify-center shrink-0 w-8 h-8">
                                    <Trophy size={26} className={podium.trophy} />
                                    <span className={`absolute -bottom-1 -right-1 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-xs ${podium.badge}`}>
                                        {podium.label}
                                    </span>
                                </div>
                                <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-xs overflow-hidden">
                                    {user.avatarUrl ? (
                                        <img 
                                            src={getFullAvatarUrl(user.avatarUrl)} 
                                            alt={user.username} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        userInitial
                                    )}
                                </div>
                                <div className="min-w-0 flex flex-col">
                                    <span className="font-black text-base sm:text-lg text-slate-950 dark:text-white truncate">
                                        {user.username}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                                        {user.totalWins ?? 0}W / {user.totalLosses ?? 0}L / {user.totalDraws ?? 0}D
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-right shrink-0 pl-2">
                                <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-indigo-400 tabular-nums">
                                    {user.eloRating}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    ELO
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
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
                    type="button"
                    onClick={handleViewAllClick} 
                    className="min-h-11 px-2 flex items-center text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                    <span>VIEW ALL</span>
                    <ChevronRight size={14} className="ml-0.5" />
                </button>
            </div>
            
            {/* List */}
            {renderLeaderboardContent()}
        </div>
    );
};

export default GlobalLeaderboard;
