import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFullLeaderboard, type LeaderboardUser } from '../../../api/userService';
import { ArrowLeft, Loader2, Trophy, Medal } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import { getFullAvatarUrl } from '../../../utils/avatarUtils';

const getWinRate = (wins: number, total: number) => 
    total === 0 ? "0%" : `${Math.round((wins / total) * 100)}%`;

const getRowBackgroundClass = (globalRank: number, isAlternate: boolean): string => {
    if (globalRank === 1) {
        return 'bg-amber-100/80 dark:bg-amber-500/10';
    }
    if (globalRank === 2) {
        return 'bg-slate-200/90 dark:bg-slate-400/10';
    }
    if (globalRank === 3) {
        return 'bg-amber-200/50 dark:bg-orange-500/10';
    }
    if (isAlternate) {
        return 'bg-slate-50 dark:bg-slate-950/50';
    }
    return 'bg-white dark:bg-transparent';
};

export const FullLeaderboardPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        getFullLeaderboard(currentPage - 1, itemsPerPage)
            .then((data) => {
                if (!isMounted) return;
                setUsers(data?.content || []);
                setTotalPages(Math.max(1, data?.totalPages || 1));
            })
            .catch((err) => {
                console.error("Failed to fetch leaderboard:", err);
                if (isMounted) {
                    setUsers([]);
                    setTotalPages(1);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [currentPage]);

    const getMedalBox = (index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        if (globalIndex === 0) {
            return (
                <div className="w-8 h-8 rounded-xl bg-amber-500 border-2 border-amber-600 text-slate-950 dark:bg-amber-500/20 dark:border-amber-400 dark:text-amber-400 flex items-center justify-center font-black shadow-sm mx-auto gap-0.5">
                    <Trophy size={14} className="text-white dark:text-amber-400" />
                    <span className="text-[11px] font-black text-white dark:text-amber-400">1</span>
                </div>
            );
        }
        if (globalIndex === 1) {
            return (
                <div className="w-8 h-8 rounded-xl bg-slate-400 border-2 border-slate-500 text-white dark:bg-slate-400/20 dark:border-slate-400 dark:text-slate-200 flex items-center justify-center font-black shadow-sm mx-auto gap-0.5">
                    <Medal size={14} className="text-white dark:text-slate-200" />
                    <span className="text-[11px] font-black text-white dark:text-slate-200">2</span>
                </div>
            );
        }
        if (globalIndex === 2) {
            return (
                <div className="w-8 h-8 rounded-xl bg-amber-800 border-2 border-amber-900 text-white dark:bg-amber-800/20 dark:border-amber-600 dark:text-amber-400 flex items-center justify-center font-black shadow-sm mx-auto gap-0.5">
                    <Medal size={14} className="text-white dark:text-amber-400" />
                    <span className="text-[11px] font-black text-white dark:text-amber-400">3</span>
                </div>
            );
        }
        return (
            <span className="font-mono text-slate-700 dark:text-slate-400 font-bold text-center text-xs sm:text-sm">
                #{globalIndex + 1}
            </span>
        );
    };

    const renderTableBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={6} className="py-28 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                            <Loader2 className="animate-spin text-indigo-600" size={34} />
                            <span className="text-xs uppercase font-bold tracking-widest">Fetching rankings...</span>
                        </div>
                    </td>
                </tr>
            );
        }

        if (users.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className="py-28 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Trophy size={40} className="opacity-30" />
                            <span className="text-xs uppercase font-bold tracking-widest">No players found</span>
                        </div>
                    </td>
                </tr>
            );
        }

        return users.map((user, index) => {
            const globalRank = (currentPage - 1) * itemsPerPage + index + 1;
            const userInitial = (user.username?.charAt(0) || 'U').toUpperCase();
            const isAlternate = index % 2 === 1;

            return (
                <tr 
                    key={user.username} 
                    className={`transition-colors ${getRowBackgroundClass(globalRank, isAlternate)} hover:bg-indigo-500/10 dark:hover:bg-indigo-500/10`}
                >
                    <td className="py-4 px-2 sm:px-6 text-center">
                        {getMedalBox(index)}
                    </td>
                    <td className="py-4 px-2 sm:px-6">
                        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs sm:text-sm font-black shrink-0 overflow-hidden shadow-xs">
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
                            <span className="font-black text-xs sm:text-base text-slate-950 dark:text-white truncate max-w-28 sm:max-w-44">
                                {user.username}
                            </span>
                        </div>
                    </td>
                    <td className="hidden md:table-cell py-4.5 px-6 text-center font-mono text-base font-black text-slate-900 dark:text-slate-300">
                        <span className="text-emerald-700 dark:text-emerald-400">{user.totalWins}</span>
                        <span className="text-slate-400 dark:text-slate-700 mx-2">/</span>
                        <span className="text-rose-700 dark:text-rose-400">{user.totalLosses}</span>
                        <span className="text-slate-400 dark:text-slate-700 mx-2">/</span>
                        <span className="text-slate-700 dark:text-slate-400">{user.totalDraws}</span>
                    </td>
                    <td className="hidden lg:table-cell py-4.5 px-6 text-center font-black text-base text-slate-950 dark:text-slate-200">
                        {user.totalGames}
                    </td>
                    <td className="hidden sm:table-cell py-4.5 px-6 text-center font-black text-base text-emerald-700 dark:text-emerald-400">
                        {getWinRate(user.totalWins, user.totalGames)}
                    </td>
                    <td className="py-4 px-3 sm:px-8 text-right font-black text-base sm:text-2xl text-slate-950 dark:text-indigo-400 tabular-nums">
                        {user.eloRating}
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="w-full max-w-350 mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 text-slate-900 dark:text-white animate-in fade-in duration-300">
            {/* Back to Dashboard */}
            <button 
                type="button"
                onClick={() => void navigate('/menu')} 
                className="min-h-11 flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-5 uppercase font-black text-xs tracking-widest cursor-pointer"
            >
                <ArrowLeft size={16} /> Back to Menu
            </button>

            {/* Header Title */}
            <div className="flex flex-col mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                    Global Rankings
                </h1>
                <div className="h-1.5 w-24 sm:w-32 bg-indigo-600 mt-2 rounded-full" />
            </div>

            {/* Responsive Table Container */}
            <div className="bg-white dark:bg-[#070b19] border border-slate-300 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-lg shadow-slate-950/5 dark:shadow-slate-950/30">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-300 dark:border-slate-800/80">
                            <th className="py-4 px-2 sm:px-6 text-center w-14 sm:w-20">Rank</th>
                            <th className="py-4 px-2 sm:px-6">Player</th>
                            <th className="hidden md:table-cell py-4 px-6 text-center">W / L / D</th>
                            <th className="hidden lg:table-cell py-4 px-6 text-center">Total Games</th>
                            <th className="hidden sm:table-cell py-4 px-6 text-center">Win Rate</th>
                            <th className="py-4 px-3 sm:px-8 text-right w-20 sm:w-28">ELO</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                        {renderTableBody()}
                    </tbody>
                </table>
            </div>

            {/* Universal Sliding Pagination */}
            <div className="mt-8">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};

export default FullLeaderboardPage;
