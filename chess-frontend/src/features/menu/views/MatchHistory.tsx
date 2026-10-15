import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { getPlayerHistory } from '../../../api/gameService';
import type { GameHistory } from '../../../types';
import { Bot, Sword, RefreshCw } from 'lucide-react';

interface MatchHistoryProps {
  userId?: number;
  limit?: number;
}

const MatchHistory = forwardRef(({ userId: propUserId, limit }: MatchHistoryProps, ref) => {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveUserId = Number(propUserId || localStorage.getItem('userId') || 0);
  const effectiveUsername = (localStorage.getItem('username') || '').toLowerCase();

  const fetchHistory = useCallback(async () => {
    if (!effectiveUserId) return;
    setIsLoading(true);
    try {
      const data = await getPlayerHistory(effectiveUserId);
      if (Array.isArray(data)) {
        const uniqueData = data.filter((item, index, self) => 
          index === self.findIndex((t) => t.id === item.id)
        );
        setHistory(uniqueData);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Match History fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserId]);

  useImperativeHandle(ref, () => ({
    refresh: fetchHistory
  }));

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: '2-digit',
      month: 'short',
      day: '2-digit'  
    });
  };

  const displayedHistory = limit ? history.slice(0, limit) : history;

  return (
    <div className="w-full animate-in fade-in duration-300 text-slate-900 dark:text-white">
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchHistory} 
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh logs"
            aria-label="Refresh logs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-wider">
            {history.length} Matches Logged
          </span>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed sm:table-auto">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80">
              <th className="py-3 px-3 sm:px-5">Opponent</th>
              <th className="py-3 px-2 sm:px-4 text-center sm:text-center w-28 sm:w-auto">Outcome</th>
              <th className="hidden md:table-cell py-3 px-4">Tactical End</th>
              <th className="hidden sm:table-cell py-3 px-4 sm:px-5 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold divide-y divide-slate-200 dark:divide-slate-800/50">
            {displayedHistory.length > 0 ? (
              displayedHistory.map((game, index) => {
                const whiteId = Number(game.whitePlayerId);
                const blackId = Number(game.blackPlayerId);
                const whiteName = (game.whitePlayerName || '').toLowerCase();
                const blackName = (game.blackPlayerName || '').toLowerCase();

                const isWhite = (effectiveUserId > 0 && whiteId === effectiveUserId) || 
                                (effectiveUsername !== '' && whiteName === effectiveUsername);
                const isBlack = (effectiveUserId > 0 && blackId === effectiveUserId) || 
                                (effectiveUsername !== '' && blackName === effectiveUsername);

                const rawOpponentName = isWhite ? game.blackPlayerName : game.whitePlayerName;
                const opponentId = isWhite ? game.blackPlayerId : game.whitePlayerId;

                const isBot = !rawOpponentName || 
                              rawOpponentName.trim() === "" || 
                              rawOpponentName.toLowerCase().includes('bot') || 
                              rawOpponentName.toLowerCase().includes('stockfish') ||
                              opponentId === 0 || 
                              opponentId == null;

                const opponentDisplay = isBot ? "Stockfish AI" : rawOpponentName;
                const opponentInitial = (opponentDisplay.charAt(0) || 'U').toUpperCase();
                const opponentAlliance = isWhite ? 'Black Alliance' : 'White Alliance';

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
                          ? 'bg-slate-100/70 dark:bg-slate-950/50'
                          : 'bg-white dark:bg-transparent'
                    } hover:bg-indigo-500/10 dark:hover:bg-indigo-500/10`}
                  >
                    <td className="py-3 px-3 sm:px-5">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        {isBot ? (
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
                            <Bot size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
                            {opponentInitial}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-950 dark:text-white font-black truncate max-w-28 sm:max-w-36">
                              {opponentDisplay}
                            </span>
                            {isBot && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                AI
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-800 dark:text-slate-400 uppercase font-black truncate">
                            {opponentAlliance}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                        userWon 
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50' 
                          : isDraw 
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border border-slate-300 dark:border-slate-700' 
                            : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${userWon ? 'bg-emerald-600' : isDraw ? 'bg-slate-600' : 'bg-rose-600'}`} />
                        {userWon ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                      </span>
                    </td>
                    <td className="hidden md:table-cell py-3 px-4 text-slate-900 dark:text-slate-300 font-bold">
                      <span className="capitalize">{String(game.finishMethod || '').toLowerCase().replace('_', ' ')}</span>
                    </td>
                    <td className="hidden sm:table-cell py-3 px-4 sm:px-5 text-right font-mono text-slate-900 dark:text-slate-400 text-[11px] font-bold">
                      {formatDate(game.playedAt)}
                    </td>
                  </tr>
                );
              })
            ) : isLoading ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={4} className="py-16 text-center text-slate-700 dark:text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Sword size={32} className="opacity-40" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">No combat data logged</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Deployment History Telemetry Notice */}
      <div className="flex items-center gap-2 mt-3 text-[10px] font-medium text-slate-600 dark:text-slate-400 px-1">
        <Bot size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span>AI matches do not impact your ELO rating.</span>
      </div>
    </div>
  );
});

export default MatchHistory;
