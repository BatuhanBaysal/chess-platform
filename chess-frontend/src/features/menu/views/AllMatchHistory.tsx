import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayerHistory } from '../../../api/gameService';
import type { GameHistory } from '../../../types';
import { ArrowLeft, Bot, Swords, Trophy } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';

interface AllMatchHistoryProps {
  userId?: number;
}

type HistoryTab = 'ranked' | 'ai';

export const AllMatchHistory: React.FC<AllMatchHistoryProps> = ({ userId: propUserId }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [activeTab, setActiveTab] = useState<HistoryTab>('ranked');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const effectiveUserId = Number(propUserId || localStorage.getItem('userId') || 0);
  const effectiveUsername = (localStorage.getItem('username') || '').toLowerCase();

  useEffect(() => {
    if (!effectiveUserId) return;
    setIsLoading(true);
    getPlayerHistory(effectiveUserId)
      .then(setHistory)
      .finally(() => setIsLoading(false));
  }, [effectiveUserId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: '2-digit',
      month: 'short',
      day: '2-digit'  
    });
  };

  const isAiMatch = (game: GameHistory) => {
    const whiteId = Number(game.whitePlayerId);
    const whiteName = (game.whitePlayerName || '').toLowerCase();

    const isWhite = (effectiveUserId > 0 && whiteId === effectiveUserId) || 
                    (effectiveUsername !== '' && whiteName === effectiveUsername);

    const rawOpponent = isWhite ? game.blackPlayerName : game.whitePlayerName;
    const opponentId = isWhite ? game.blackPlayerId : game.whitePlayerId;

    return !rawOpponent || 
           rawOpponent.trim() === "" || 
           rawOpponent.toLowerCase().includes('bot') || 
           rawOpponent.toLowerCase().includes('stockfish') ||
           opponentId === 0 || 
           opponentId == null;
  };

  const rankedMatches = useMemo(() => history.filter(g => !isAiMatch(g)), [history]);
  const aiMatches = useMemo(() => history.filter(g => isAiMatch(g)), [history]);

  const currentList = activeTab === 'ranked' ? rankedMatches : aiMatches;
  const totalPages = Math.max(1, Math.ceil(currentList.length / itemsPerPage));
  const paginatedHistory = currentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (tab: HistoryTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-slate-900 dark:text-white animate-in fade-in duration-300">
      {/* Return to Dashboard */}
      <button 
        type="button"
        onClick={() => navigate('/menu')} 
        className="min-h-11 flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-5 uppercase font-black text-xs tracking-widest cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Menu
      </button>

      {/* Header */}
      <div className="flex flex-col mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
          Match History
        </h1>
        <div className="h-1.5 w-24 sm:w-32 bg-indigo-600 mt-2 rounded-full" />
      </div>

      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl w-full sm:w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('ranked')}
          className={`min-h-11 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ranked'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Swords size={16} />
          <span>Ranked (PvP) ({rankedMatches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('ai')}
          className={`min-h-11 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Bot size={16} />
          <span>AI Practice ({aiMatches.length})</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-lg shadow-slate-950/5 dark:shadow-slate-950/30">
        <div className="w-full overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed sm:table-auto">
            <thead>
              <tr className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80">
                <th className="py-4 px-4 sm:px-6">Opponent</th>
                <th className="py-4 px-3 sm:px-6 text-center w-28 sm:w-auto">Outcome</th>
                <th className="hidden md:table-cell py-4 px-6 text-center">Result Type</th>
                <th className="hidden sm:table-cell py-4 px-6 text-center">Date</th>
                <th className="hidden lg:table-cell py-4 px-8 text-right">Match ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/50">
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((game, index) => {
                  const whiteId = Number(game.whitePlayerId);
                  const blackId = Number(game.blackPlayerId);
                  const whiteName = (game.whitePlayerName || '').toLowerCase();
                  const blackName = (game.blackPlayerName || '').toLowerCase();

                  const isWhite = (effectiveUserId > 0 && whiteId === effectiveUserId) || 
                                  (effectiveUsername !== '' && whiteName === effectiveUsername);
                  const isBlack = (effectiveUserId > 0 && blackId === effectiveUserId) || 
                                  (effectiveUsername !== '' && blackName === effectiveUsername);

                  const rawOpponent = isWhite ? game.blackPlayerName : game.whitePlayerName;
                  const opponentId = isWhite ? game.blackPlayerId : game.whitePlayerId;

                  const isBot = !rawOpponent || 
                                rawOpponent.trim() === "" || 
                                rawOpponent.toLowerCase().includes('bot') || 
                                rawOpponent.toLowerCase().includes('stockfish') ||
                                opponentId === 0 || 
                                opponentId == null;

                  const opponent = isBot ? "Stockfish AI" : rawOpponent;
                  const opponentInitial = (opponent.charAt(0) || 'U').toUpperCase();
                  const isGuestOpponent = opponent.toLowerCase().startsWith('guest');
                  const playerRoleText = isWhite ? 'Playing Black' : 'Playing White';

                  const resultStr = String(game.result || '').toUpperCase();
                  const statusStr = String((game as any).status || '').toUpperCase();
                  const finishMethodStr = String(game.finishMethod || '').toUpperCase();
                  const combinedResult = `${resultStr} ${statusStr} ${finishMethodStr}`;

                  const isDraw = combinedResult.includes('DRAW') || 
                                 combinedResult.includes('STALEMATE') || 
                                 combinedResult.includes('1/2') || 
                                 resultStr === '1/2-1/2';

                  const isWhiteVictory = combinedResult.includes('WHITE_WON') || 
                                         combinedResult.includes('WHITE_WIN') || 
                                         resultStr === '1-0' || 
                                         resultStr === 'WHITE';

                  const isBlackVictory = combinedResult.includes('BLACK_WON') || 
                                         combinedResult.includes('BLACK_WIN') || 
                                         resultStr === '0-1' || 
                                         resultStr === 'BLACK';

                  const winnerId = Number((game as any).winnerId || (game as any).winner?.id || 0);
                  const winnerColor = String((game as any).winnerColor || (game as any).winner || '').toUpperCase();
                  const winnerName = String((game as any).winnerName || (game as any).winner?.username || '').toLowerCase();

                  let userWon = false;
                  if (!isDraw) {
                    if (winnerId > 0 && effectiveUserId > 0) {
                      userWon = winnerId === effectiveUserId;
                    } else if (winnerName && effectiveUsername) {
                      userWon = winnerName === effectiveUsername;
                    } else if (winnerColor.includes('WHITE')) {
                      userWon = isWhite;
                    } else if (winnerColor.includes('BLACK')) {
                      userWon = isBlack;
                    } else if (isWhiteVictory && isWhite) {
                      userWon = true;
                    } else if (isBlackVictory && isBlack) {
                      userWon = true;
                    }
                  }

                  const isAlternate = index % 2 === 1;

                  return (
                    <tr 
                      key={game.id} 
                      className={`transition-colors ${
                        isBot
                          ? isAlternate
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
                            : 'bg-indigo-50/40 dark:bg-indigo-950/15'
                          : isAlternate
                            ? 'bg-slate-50/90 dark:bg-slate-950/50'
                            : 'bg-white dark:bg-transparent'
                      } hover:bg-indigo-500/10 dark:hover:bg-indigo-500/10`}
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {isBot ? (
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
                              <Bot size={18} />
                            </div>
                          ) : (
                            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs sm:text-sm font-black shrink-0 overflow-hidden shadow-2xs">
                              {!isGuestOpponent && (
                                <img 
                                  src={`/api/users/${opponent}/avatar`} 
                                  alt={opponent} 
                                  className="w-full h-full object-cover z-10"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              )}
                              <span className="absolute z-0">{opponentInitial}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-sm sm:text-base text-slate-950 dark:text-white truncate max-w-28 sm:max-w-44">
                                {opponent}
                              </p>
                              {isBot && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  AI
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase mt-0.5 truncate">
                              {playerRoleText}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap ${
                          userWon 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' 
                            : isDraw 
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700' 
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${userWon ? 'bg-emerald-500' : isDraw ? 'bg-slate-400' : 'bg-rose-500'}`} />
                          {userWon ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell py-4.5 px-6 text-center text-slate-700 dark:text-slate-300 font-medium text-sm">
                        <span className="capitalize">{String(game.finishMethod || '').toLowerCase().replace('_', ' ')}</span>
                      </td>
                      <td className="hidden sm:table-cell py-4.5 px-6 text-center font-mono text-slate-600 dark:text-slate-400 text-sm">
                        {formatDate(game.playedAt)}
                      </td>
                      <td className="hidden lg:table-cell py-4.5 px-8 text-right font-mono font-bold text-base text-indigo-600 dark:text-indigo-400">
                        #{game.id}
                      </td>
                    </tr>
                  );
                })
              ) : isLoading ? (
                <tr>
                  <td colSpan={5} className="py-28 text-center">
                    <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    {activeTab === 'ranked' ? (
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-500 max-w-sm mx-auto">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                          <Trophy size={32} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          No Ranked Matches Yet
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Find an online opponent in matchmaking to play rated matches and earn ELO rating points.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-500 max-w-sm mx-auto">
                        <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs">
                          <Bot size={32} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          No AI Matches Recorded
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Challenge Stockfish AI engine to practice strategies and improve your tactics risk-free.
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-center gap-2 mt-4 text-[11px] font-medium text-slate-500 dark:text-slate-400 px-1">
        <Bot size={14} className="text-indigo-500 shrink-0" />
        <span>AI practice matches do not impact your ELO rating.</span>
      </div>

      {/* Universal Dynamic Sliding Pagination */}
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

export default AllMatchHistory;
