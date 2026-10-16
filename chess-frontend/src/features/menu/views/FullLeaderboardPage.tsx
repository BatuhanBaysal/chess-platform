import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFullLeaderboard, type LeaderboardUser } from '../../../api/userService';
import { ChevronLeft, ChevronRight, Medal, ArrowLeft, Loader2, Trophy } from 'lucide-react';

export const FullLeaderboardPage: React.FC = () => {
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

    const getWinRate = (wins: number, total: number) => 
        total === 0 ? "0%" : `${Math.round((wins / total) * 100)}%`;

    const getMedal = (index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        if (globalIndex === 0) return <Medal className="text-amber-500 drop-shadow-sm" size={26} fill="currentColor" />;
        if (globalIndex === 1) return <Medal className="text-slate-400 drop-shadow-sm" size={26} fill="currentColor" />;
        if (globalIndex === 2) return <Medal className="text-amber-700 dark:text-amber-600 drop-shadow-sm" size={26} fill="currentColor" />;
        return <span className="font-mono text-slate-500 dark:text-slate-400 font-bold w-8 text-center text-sm sm:text-base">#{globalIndex + 1}</span>;
    };

    return (
        <div className="w-full max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-slate-900 dark:text-white animate-in fade-in duration-300">
            {/* Back to Dashboard */}
            <button 
                onClick={() => navigate('/')} 
                className="min-h-11 flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-5 uppercase font-black text-xs tracking-widest cursor-pointer"
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
            <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-lg shadow-slate-950/5 dark:shadow-slate-950/30">
                <div className="w-full overflow-hidden">
                    <table className="w-full text-left border-collapse table-fixed sm:table-auto">
                        <thead>
                            <tr className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80">
                                <th className="py-4 px-3 sm:px-6 text-center w-16 sm:w-24">Rank</th>
                                <th className="py-4 px-3 sm:px-6">Player</th>
                                <th className="hidden md:table-cell py-4 px-6 text-center">W / L / D</th>
                                <th className="hidden lg:table-cell py-4 px-6 text-center">Total Games</th>
                                <th className="hidden sm:table-cell py-4 px-6 text-center">Win Rate</th>
                                <th className="py-4 px-4 sm:px-8 text-right w-24 sm:w-auto">ELO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-28 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                            <Loader2 className="animate-spin text-indigo-600" size={34} />
                                            <span className="text-xs uppercase font-bold tracking-widest">Fetching rankings...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((user, index) => {
                                    const userInitial = (user.username?.charAt(0) || 'U').toUpperCase();
                                    const isAlternate = index % 2 === 1;

                                    return (
                                        <tr 
                                          key={user.username} 
                                          className={`transition-colors ${
                                            isAlternate 
                                              ? 'bg-slate-50/90 dark:bg-slate-950/50' 
                                              : 'bg-white dark:bg-transparent'
                                          } hover:bg-indigo-500/10 dark:hover:bg-indigo-500/10`}
                                        >
                                            <td className="py-4 px-3 sm:px-6 text-center">
                                                <div className="flex justify-center items-center">
                                                    {getMedal(index)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-3 sm:px-6">
                                                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs sm:text-sm font-black shrink-0 shadow-xs">
                                                        {userInitial}
                                                    </div>
                                                    <span className="font-bold text-sm sm:text-base text-slate-950 dark:text-white truncate">
                                                        {user.username}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell py-4.5 px-6 text-center font-mono text-base font-bold text-slate-700 dark:text-slate-300">
                                                <span className="text-emerald-600 dark:text-emerald-400">{user.totalWins}</span>
                                                <span className="text-slate-300 dark:text-slate-700 mx-2">/</span>
                                                <span className="text-rose-600 dark:text-rose-400">{user.totalLosses}</span>
                                                <span className="text-slate-300 dark:text-slate-700 mx-2">/</span>
                                                <span className="text-slate-500">{user.totalDraws}</span>
                                            </td>
                                            <td className="hidden lg:table-cell py-4.5 px-6 text-center font-bold text-base text-slate-800 dark:text-slate-200">
                                                {user.totalGames}
                                            </td>
                                            <td className="hidden sm:table-cell py-4.5 px-6 text-center font-black text-base text-emerald-600 dark:text-emerald-400">
                                                {getWinRate(user.totalWins, user.totalGames)}
                                            </td>
                                            <td className="py-4 px-4 sm:px-8 text-right font-black text-base sm:text-2xl text-indigo-600 dark:text-indigo-400 tabular-nums">
                                                {user.eloRating}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-28 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Trophy size={40} className="opacity-30" />
                                            <span className="text-xs uppercase font-bold tracking-widest">No players found</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-3 sm:gap-4 mt-7 sm:mt-8">
                <button 
                    disabled={currentPage === 1 || isLoading} 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    className="min-h-11 min-w-11 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    aria-label="Previous Page"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="min-h-11 flex items-center text-xs sm:text-sm font-black uppercase tracking-wider bg-white dark:bg-slate-900 px-5 sm:px-7 rounded-xl border border-slate-200 dark:border-slate-800">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button 
                    disabled={currentPage >= totalPages || isLoading} 
                    onClick={() => setCurrentPage(p => p + 1)} 
                    className="min-h-11 min-w-11 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    aria-label="Next Page"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default FullLeaderboardPage;
