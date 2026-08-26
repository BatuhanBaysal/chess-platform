import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFullLeaderboard, type LeaderboardUser } from '../../../api/userService';
import { ChevronLeft, ChevronRight, Medal, ArrowLeft } from 'lucide-react';

const FullLeaderboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [allUsers, setAllUsers] = useState<LeaderboardUser[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        getFullLeaderboard().then(setAllUsers);
    }, []);

    const totalPages = Math.ceil(allUsers.length / itemsPerPage);
    const paginatedUsers = allUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getWinRate = (wins: number, total: number) => total === 0 ? "0%" : `${Math.round((wins / total) * 100)}%`;

    const getMedal = (index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        if (globalIndex === 0) return <Medal className="text-amber-500" size={32} fill="currentColor" />;
        if (globalIndex === 1) return <Medal className="text-slate-400" size={32} fill="currentColor" />;
        if (globalIndex === 2) return <Medal className="text-orange-700 dark:text-amber-800" size={32} fill="currentColor" />;
        return <span className="font-mono text-slate-500 dark:text-slate-500 font-bold w-12 text-center text-lg">#{globalIndex + 1}</span>;
    };

    return (
        <div className="min-h-screen pt-12 pb-12 px-6 md:px-12 max-w-8xl mx-auto text-slate-900 dark:text-white">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 uppercase font-black text-xs tracking-widest">
                <ArrowLeft size={16} /> Back to Menu
            </button>

            <div className="flex flex-col mb-10">
                <h2 className="text-6xl font-black uppercase tracking-tighter italic">
                    Global Rankings
                </h2>
                <div className="h-1.5 w-32 bg-blue-600 dark:bg-blue-500 mt-3 rounded-full" />
            </div>

            <div className="grid grid-cols-7 px-10 pb-6 text-xs font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                <div className="col-span-1">Rank</div>
                <div className="col-span-2">Username</div>
                <div className="col-span-1 text-center">W/L/D</div>
                <div className="col-span-1 text-center">Total Games</div>
                <div className="col-span-1 text-center">Winrate</div>
                <div className="col-span-1 text-right">ELO Rating</div>
            </div>

            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedUsers.map((user, index) => (
                    <div key={user.username} className="grid grid-cols-7 px-10 py-8 items-center hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all duration-200">
                        <div className="col-span-1">{getMedal(index)}</div>
                        <div className="col-span-2 font-bold text-2xl tracking-tight">{user.username}</div>
                        <div className="col-span-1 text-center font-mono text-base text-slate-600 dark:text-slate-400">
                            {user.totalWins}<span className="text-slate-400 mx-2">/</span>{user.totalLosses}<span className="text-slate-400 mx-2">/</span>{user.totalDraws}
                        </div>
                        <div className="col-span-1 text-center font-bold text-slate-600 dark:text-slate-500 text-lg">
                            {user.totalGames}
                        </div>
                        <div className="col-span-1 text-center font-black text-emerald-600 dark:text-emerald-500 text-lg">
                            {getWinRate(user.totalWins, user.totalGames)}
                        </div>
                        <div className="col-span-1 text-right font-black text-3xl text-blue-700 dark:text-blue-400 tabular-nums">
                            {user.eloRating}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center items-center gap-6 mt-12">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20"><ChevronLeft size={24} /></button>
                <span className="text-sm font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-800">Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20"><ChevronRight size={24} /></button>
            </div>
        </div>
    );
};

export default FullLeaderboardPage;
