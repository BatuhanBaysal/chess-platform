import React, { useEffect, useState } from 'react';
import { getPlayerHistory } from '../../api/gameService';
import { ChevronLeft, ChevronRight, ArrowLeft, Hash } from 'lucide-react';

interface GameHistory {
    id: number;
    whitePlayerId: number;
    whitePlayerName: string;
    blackPlayerId: number;
    blackPlayerName: string;
    result: 'WHITE_WIN' | 'BLACK_WIN' | 'DRAW';
    finishMethod: string;
    playedAt: string;
}

interface AllMatchHistoryProps {
    userId: number;
    onBack: () => void; 
}

const AllMatchHistory: React.FC<AllMatchHistoryProps> = ({ userId, onBack }) => {
    const [history, setHistory] = useState<GameHistory[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        getPlayerHistory(userId).then(setHistory);
    }, [userId]);

    const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
    const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: '2-digit',
            month: 'short',
            day: '2-digit'  
        });
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto text-slate-900 dark:text-white animate-in fade-in duration-500">
            <button 
                onClick={onBack} 
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 uppercase font-black text-xs tracking-widest"
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="flex flex-col mb-10">
                <h2 className="text-6xl font-black uppercase tracking-tighter italic">Combat Archive</h2>
                <div className="h-1.5 w-32 bg-blue-600 dark:bg-blue-500 mt-3 rounded-full" />
            </div>
            
            <div className="grid grid-cols-6 px-10 pb-6 text-xs font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                <div className="col-span-2">Opponent</div>
                <div className="col-span-1 text-center">Outcome</div>
                <div className="col-span-1 text-center">Tactical End</div>
                <div className="col-span-1 text-center">Date</div>
                <div className="col-span-1 text-right">Match ID</div>
            </div>

            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedHistory.map((game) => {
                    const isWhite = game.whitePlayerId === userId;
                    const opponent = isWhite ? game.blackPlayerName : game.whitePlayerName;
                    const userWon = (isWhite && game.result === 'WHITE_WIN') || (!isWhite && game.result === 'BLACK_WIN');
                    const isDraw = game.result === 'DRAW';

                    return (
                        <div key={game.id} className="grid grid-cols-6 px-10 py-8 items-center hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all">
                            <div className="col-span-2 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Hash size={20} className="opacity-40" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{opponent || "Training Bot"}</p>
                                    <p className="text-[10px] font-black opacity-50 uppercase">{isWhite ? 'White Alliance' : 'Black Alliance'}</p>
                                </div>
                            </div>
                            <div className={`col-span-1 text-center font-black uppercase tracking-widest ${userWon ? 'text-emerald-500' : isDraw ? 'text-slate-500' : 'text-rose-500'}`}>
                                {userWon ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                            </div>
                            <div className="col-span-1 text-center text-sm font-medium opacity-60 capitalize">
                                {game.finishMethod.toLowerCase().replace('_', ' ')}
                            </div>
                            <div className="col-span-1 text-center font-mono opacity-50">
                                {formatDate(game.playedAt)}
                            </div>
                            <div className="col-span-1 text-right font-black text-blue-600 dark:text-blue-400">
                                #{game.id}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center items-center gap-6 mt-12">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-200 disabled:opacity-20"><ChevronLeft size={24} /></button>
                <span className="text-sm font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-800">Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-200 disabled:opacity-20"><ChevronRight size={24} /></button>
            </div>
        </div>
    );
};

export default AllMatchHistory;
