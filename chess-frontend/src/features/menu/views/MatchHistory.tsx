import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { getPlayerHistory } from '../../../api/gameService';
import type { GameHistory } from '../../../types';
import { Bot, Sword, RefreshCw, Play } from 'lucide-react';
import { getUsernameAvatarUrl } from '../../../utils/avatarUtils';
import { MatchReplayModal } from '../../chess/modals/MatchReplayModal';

interface MatchHistoryProps {
  readonly userId?: number;
  readonly limit?: number;
}

export interface MatchHistoryHandle {
  refresh: () => Promise<void>;
}

interface MatchDetails {
  opponentDisplay: string;
  opponentInitial: string;
  isBot: boolean;
  isGuestOpponent: boolean;
  isWhite: boolean;
  userColor: 'white' | 'black';
  outcomeText: 'Victory' | 'Draw' | 'Defeat';
  userWon: boolean;
  isDraw: boolean;
}

interface WinnerTelemetry {
  winnerId?: number | string;
  winner?: { id?: number | string; username?: string };
  winnerColor?: string;
  winnerName?: string;
  status?: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: '2-digit',
    month: 'short',
    day: '2-digit'  
  });
};

const getOutcomeText = (userWon: boolean, isDraw: boolean): 'Victory' | 'Draw' | 'Defeat' => {
  if (userWon) return 'Victory';
  if (isDraw) return 'Draw';
  return 'Defeat';
};

const getOutcomeDotClass = (userWon: boolean, isDraw: boolean): string => {
  if (userWon) return 'bg-emerald-600';
  if (isDraw) return 'bg-slate-600';
  return 'bg-rose-600';
};

const getMatchRowBgClass = (isBot: boolean, isAlternate: boolean): string => {
  if (isBot) {
    return isAlternate
      ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
      : 'bg-indigo-50/40 dark:bg-indigo-950/15';
  }
  return isAlternate
    ? 'bg-slate-100/70 dark:bg-slate-950/50'
    : 'bg-white dark:bg-transparent';
};

const getOutcomeBadgeClass = (userWon: boolean, isDraw: boolean): string => {
  if (userWon) {
    return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50';
  }
  if (isDraw) {
    return 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border border-slate-300 dark:border-slate-700';
  }
  return 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/50';
};

const determinePlayerSide = (
  game: GameHistory,
  effectiveUserId: number,
  effectiveUsername: string
): boolean => {
  const whiteId = Number(game.whitePlayerId);
  const blackId = Number(game.blackPlayerId);
  const whiteName = (game.whitePlayerName || '').toLowerCase();
  const blackName = (game.blackPlayerName || '').toLowerCase();

  const isBotWhite = whiteId === -1 || whiteName.includes('stockfish') || whiteName.includes('bot');
  const isUserWhite = (effectiveUserId > 0 && whiteId === effectiveUserId) || 
                      (effectiveUsername !== '' && whiteName === effectiveUsername) ||
                      (!isBotWhite && (blackId === -1 || blackName.includes('stockfish') || blackName.includes('bot')));

  return isUserWhite && !isBotWhite;
};

const determineUserWon = (
  game: GameHistory,
  isWhite: boolean,
  isDraw: boolean,
  effectiveUserId: number,
  effectiveUsername: string
): boolean => {
  if (isDraw) return false;

  const g = game as unknown as WinnerTelemetry;
  const winnerId = Number(g.winnerId || g.winner?.id || 0);
  const winnerName = String(g.winnerName || g.winner?.username || '').toLowerCase();
  const winnerColor = typeof g.winnerColor === 'string' ? g.winnerColor.toUpperCase() : '';

  if (winnerId > 0 && effectiveUserId > 0) {
    return winnerId === effectiveUserId;
  }
  if (winnerName && effectiveUsername) {
    return winnerName === effectiveUsername;
  }
  if (winnerColor.includes('WHITE')) {
    return isWhite;
  }
  if (winnerColor.includes('BLACK')) {
    return !isWhite;
  }

  const resultStr = String(game.result || '').toUpperCase();
  const statusStr = String(g.status || '').toUpperCase();
  const finishMethodStr = String(game.finishMethod || '').toUpperCase();
  const combined = `${resultStr} ${statusStr} ${finishMethodStr}`;

  const isWhiteVictory = combined.includes('WHITE_WON') || combined.includes('WHITE_WIN') || resultStr === '1-0' || resultStr === 'WHITE';
  const isBlackVictory = combined.includes('BLACK_WON') || combined.includes('BLACK_WIN') || resultStr === '0-1' || resultStr === 'BLACK';

  if (isWhiteVictory && isWhite) return true;
  return isBlackVictory && !isWhite;
};

const resolveMatchDetails = (
  game: GameHistory,
  effectiveUserId: number,
  effectiveUsername: string
): MatchDetails => {
  const isWhite = determinePlayerSide(game, effectiveUserId, effectiveUsername);
  const userColor: 'white' | 'black' = isWhite ? 'white' : 'black';

  const rawOpponentName = isWhite ? game.blackPlayerName : game.whitePlayerName;
  const opponentId = isWhite ? game.blackPlayerId : game.whitePlayerId;

  const isBot = !rawOpponentName || 
                rawOpponentName.trim() === "" || 
                rawOpponentName.toLowerCase().includes('bot') || 
                rawOpponentName.toLowerCase().includes('stockfish') ||
                opponentId === 0 || 
                opponentId == null ||
                opponentId === -1;

  const opponentDisplay = isBot ? "Stockfish AI" : rawOpponentName;
  const opponentInitial = (opponentDisplay.charAt(0) || 'U').toUpperCase();
  const isGuestOpponent = opponentDisplay.toLowerCase().startsWith('guest');

  const resultStr = String(game.result || '').toUpperCase();
  const statusStr = String((game as { status?: string }).status || '').toUpperCase();
  const finishMethodStr = String(game.finishMethod || '').toUpperCase();
  const combinedResult = `${resultStr} ${statusStr} ${finishMethodStr}`;

  const isDraw = combinedResult.includes('DRAW') || 
                 combinedResult.includes('STALEMATE') || 
                 combinedResult.includes('1/2') || 
                 resultStr === '1/2-1/2';

  const userWon = determineUserWon(game, isWhite, isDraw, effectiveUserId, effectiveUsername);
  const outcomeText = getOutcomeText(userWon, isDraw);

  return {
    opponentDisplay,
    opponentInitial,
    isBot,
    isGuestOpponent,
    isWhite,
    userColor,
    outcomeText,
    userWon,
    isDraw
  };
};

const MatchHistory = forwardRef<MatchHistoryHandle, Readonly<MatchHistoryProps>>(({ userId: propUserId, limit }, ref) => {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReplayGame, setSelectedReplayGame] = useState<{
    id: number | string;
    opponent: string;
    result: string;
    playerColor: 'white' | 'black';
  } | null>(null);

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
    } catch (error: unknown) {
      console.error("Match History fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserId]);

  useImperativeHandle(ref, () => ({
    refresh: fetchHistory
  }));

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const displayedHistory = limit ? history.slice(0, limit) : history;

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={5} className="py-16 text-center">
            <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </td>
        </tr>
      );
    }

    if (displayedHistory.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="py-16 text-center text-slate-700 dark:text-slate-400">
            <div className="flex flex-col items-center gap-2">
              <Sword size={32} className="opacity-40" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">
                No match data recorded
              </span>
            </div>
          </td>
        </tr>
      );
    }

    return displayedHistory.map((game, index) => {
      const details = resolveMatchDetails(game, effectiveUserId, effectiveUsername);
      const isAlternate = index % 2 === 1;
      const roleBadgeText = details.isWhite ? 'YOU: WHITE' : 'YOU: BLACK';

      return (
        <tr 
          key={game.id} 
          className={`transition-colors ${getMatchRowBgClass(details.isBot, isAlternate)} hover:bg-indigo-500/10 dark:hover:bg-indigo-500/10`}
        >
          <td className="py-3 px-3 sm:px-5">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {details.isBot ? (
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot size={16} />
                </div>
              ) : (
                <div className="relative w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 overflow-hidden shadow-2xs">
                  {!details.isGuestOpponent && (
                    <img 
                      src={getUsernameAvatarUrl(details.opponentDisplay)} 
                      alt={details.opponentDisplay} 
                      className="w-full h-full object-cover z-10"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span className="absolute z-0">{details.opponentInitial}</span>
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-slate-950 dark:text-white font-black truncate max-w-24 sm:max-w-36 text-xs sm:text-sm">
                    {details.opponentDisplay}
                  </span>
                  {details.isBot && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                      AI
                    </span>
                  )}
                </div>
                <span className={`text-[10px] uppercase font-black tracking-wider truncate ${
                  details.isWhite ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {roleBadgeText}
                </span>
              </div>
            </div>
          </td>
          <td className="py-3 px-2 sm:px-4 text-center">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${getOutcomeBadgeClass(details.userWon, details.isDraw)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${getOutcomeDotClass(details.userWon, details.isDraw)}`} />
              {details.outcomeText}
            </span>
          </td>
          <td className="hidden md:table-cell py-3 px-4 text-slate-900 dark:text-slate-300 font-bold">
            <span className="capitalize">{String(game.finishMethod || '').toLowerCase().replace('_', ' ')}</span>
          </td>
          <td className="hidden sm:table-cell py-3 px-4 sm:px-5 text-right font-mono text-slate-900 dark:text-slate-400 text-[11px] font-bold">
            {formatDate(game.playedAt)}
          </td>
          <td className="py-3 px-2 sm:px-4 text-center">
            <button
              type="button"
              onClick={() => setSelectedReplayGame({
                id: game.id,
                opponent: details.opponentDisplay,
                result: details.outcomeText,
                playerColor: details.userColor
              })}
              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center shadow-2xs"
              title="Replay PGN Match"
              aria-label="Replay match"
            >
              <Play size={13} fill="currentColor" />
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="w-full animate-in fade-in duration-300 text-slate-900 dark:text-white">
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => void fetchHistory()} 
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh match history"
            aria-label="Refresh match history"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-wider">
            {history.length} Matches Recorded
          </span>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80">
              <th className="py-3 px-3 sm:px-5">Opponent</th>
              <th className="py-3 px-2 sm:px-4 text-center w-24 sm:w-32 whitespace-nowrap">Outcome</th>
              <th className="hidden md:table-cell py-3 px-4">Result Type</th>
              <th className="hidden sm:table-cell py-3 px-4 sm:px-5 text-right">Date</th>
              <th className="py-3 px-2 sm:px-4 text-center w-14 sm:w-16 whitespace-nowrap">Replay</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold divide-y divide-slate-200 dark:divide-slate-800/50">
            {renderTableContent()}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 mt-3 text-[10px] font-medium text-slate-600 dark:text-slate-400 px-1">
        <Bot size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span>AI practice matches do not impact your ELO rating.</span>
      </div>

      <MatchReplayModal
        isOpen={Boolean(selectedReplayGame)}
        onClose={() => setSelectedReplayGame(null)}
        gameId={selectedReplayGame?.id ?? null}
        opponentName={selectedReplayGame?.opponent}
        result={selectedReplayGame?.result}
        playerColor={selectedReplayGame?.playerColor}
      />
    </div>
  );
});

MatchHistory.displayName = 'MatchHistory';

export default MatchHistory;
