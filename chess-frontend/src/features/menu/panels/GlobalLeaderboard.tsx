import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard, type LeaderboardUser } from '../../../api/userService';
import { Trophy } from 'lucide-react';

const GlobalLeaderboard: React.FC = () => {
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
        if (index === 0) return 'text-amber-500';
        if (index === 1) return 'text-slate-400';
        return 'text-orange-700 dark:text-amber-800';
    };

    if (isLoading) return <div className="p-10 text-center text-slate-500">Syncing rankings...</div>;
    if (users.length === 0) return <div className="p-10 text-center text-slate-500">No active players found.</div>;

    return (
        <div className="w-full px-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-base font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3">
                    <Trophy size={20} className="text-blue-600 dark:text-blue-400" />
                    Top Players
                </h2>
                <button 
                    onClick={handleViewAllClick} 
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors cursor-pointer"
                >
                    View All &gt;
                </button>
            </div>
            
            <div className="space-y-4">
                {users.slice(0, 3).map((user, index) => (
                    <div key={user.username} className="grid grid-cols-3 items-center justify-items-center py-5 border-b border-slate-200 dark:border-slate-800/50">
                        <div className="flex items-center justify-center gap-3">
                            <Trophy size={24} className={getTrophyColor(index)} />
                            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
                                {user.username}
                            </span>
                        </div>
                        
                        <span className="text-base font-mono text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                            {user.totalWins ?? 0}W / {user.totalLosses ?? 0}L / {user.totalDraws ?? 0}D
                        </span>

                        <span className="text-2xl font-black text-blue-700 dark:text-blue-400 tabular-nums">
                            {user.eloRating} <span className="text-xs text-slate-500 dark:text-slate-600 font-bold">ELO</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GlobalLeaderboard;
