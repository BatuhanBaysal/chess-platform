import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayerHistory } from '../../../api/gameService';
import type { GameHistory } from '../../../types';
import { ArrowLeft, Bot, Swords, Trophy, Play } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import { getUsernameAvatarUrl } from '../../../utils/avatarUtils';
import { MatchReplayModal } from '../../chess/modals/MatchReplayModal';

interface AllMatchHistoryProps {
  readonly userId?: number;
}

type HistoryTab = 'ranked' | 'ai';

interface MatchDetails {
  opponent: string;
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
  if (userWon) return 'bg-emerald-500';
  if (isDraw) return 'bg-slate-400';
  return 'bg-rose-500';
};

const isAiMatch = (game: GameHistory, effectiveUserId: number, effectiveUsername: string) => {
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
         opponentId == null ||
         opponentId === -1;
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

  const rawOpponent = isWhite ? game.blackPlayerName : game.whitePlayerName;
  const opponentId = isWhite ? game.blackPlayerId : game.whitePlayerId;

  const isBot = !rawOpponent || 
                rawOpponent.trim() === "" || 
                rawOpponent.toLowerCase().includes('bot') || 
                rawOpponent.toLowerCase().includes('stockfish') ||
                opponentId === 0 || 
                opponentId == null ||
                opponentId === -1;

  const opponent = isBot ? "Stockfish AI" : rawOpponent;
  const opponentInitial = (opponent.charAt(0) || 'U').toUpperCase();
  const isGuestOpponent = opponent.toLowerCase().startsWith('guest');

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
    opponent,
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

const getMatchRowBgClass = (isBot: boolean, isAlternate: boolean): string => {
  if (isBot) {
    return isAlternate
      ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
      : 'bg-indigo-50/40 dark:bg-indigo-950/15';
  }
  return isAlternate
    ? 'bg-slate-50/90 dark:bg-slate-950/50'
    : 'bg-white dark:bg-transparent';
};

const getOutcomeBadgeClass = (userWon: boolean, isDraw: boolean): string => {
  if (userWon) {
    return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';
  }
  if (isDraw) {
    return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  }
  return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50';
};

export const AllMatchHistory = ({ userId: propUserId }: Readonly<AllMatchHistoryProps>) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [activeTab, setActiveTab] = useState<HistoryTab>('ranked');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReplayGame, setSelectedReplayGame] = useState<{
    id: number | string;
    opponent: string;
    result: string;
    playerColor: 'white' | 'black';
  } | null>(null);

  const itemsPerPage = 10;

  const effectiveUserId = Number(propUserId || localStorage.getItem('userId') || 0);
  const effectiveUsername = (localStorage.getItem('username') || '').toLowerCase();

  useEffect(() => {
    if (!effectiveUserId) return;
    setIsLoading(true);
    void getPlayerHistory(effectiveUserId)
      .then(setHistory)
      .finally(() => setIsLoading(false));
  }, [effectiveUserId]);

  const rankedMatches = useMemo(
    () => history.filter(g => !isAiMatch(g, effectiveUserId, effectiveUsername)),
    [history, effectiveUserId, effectiveUsername]
  );
  const aiMatches = useMemo(
    () => history.filter(g => isAiMatch(g, effectiveUserId, effectiveUsername)),
    [history, effectiveUserId, effectiveUsername]
  );

  const currentList = activeTab === 'ranked' ? rankedMatches : aiMatches;
  const totalPages = Math.max(1, Math.ceil(currentList.length / itemsPerPage));
  const paginatedHistory = currentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (tab: HistoryTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={6} className="py-28 text-center">
            <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </td>
        </tr>
      );
    }

    if (paginatedHistory.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="py-24 text-center">
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
      );
    }

    return paginatedHistory.map((game, index) => {
      const details = resolveMatchDetails(game, effectiveUserId, effectiveUsername);
      const isAlternate = index % 2 === 1;
      const roleBadgeText = details.isWhite ? 'YOU: WHITE' : 'YOU: BLACK';

      return (
        <tr 
          key={game.id} 
          className={`transition-colors ${getMatchRowBgClass(details.isBot, isAlternate)} hover:bg-indigo-500/10 dark:hover:bg-indigo-500/10`}
        >
          <td className="py-4 px-3 sm:px-6">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {details.isBot ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot size={16} />
                </div>
              ) : (
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs sm:text-sm font-black shrink-0 overflow-hidden shadow-2xs">
                  {!details.isGuestOpponent && (
                    <img 
                      src={getUsernameAvatarUrl(details.opponent)} 
                      alt={details.opponent} 
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
                  <p className="font-bold text-xs sm:text-base text-slate-950 dark:text-white truncate max-w-24 sm:max-w-44">
                    {details.opponent}
                  </p>
                  {details.isBot && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                      AI
                    </span>
                  )}
                </div>
                <p className={`text-[10px] sm:text-xs font-black uppercase mt-0.5 truncate ${
                  details.isWhite ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {roleBadgeText}
                </p>
              </div>
            </div>
          </td>
          <td className="py-4 px-2 sm:px-6 text-center">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap ${getOutcomeBadgeClass(details.userWon, details.isDraw)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${getOutcomeDotClass(details.userWon, details.isDraw)}`} />
              {details.outcomeText}
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
          <td className="py-4 px-2 sm:px-6 text-center">
            <button
              type="button"
              onClick={() => setSelectedReplayGame({
                id: game.id,
                opponent: details.opponent,
                result: details.outcomeText,
                playerColor: details.userColor
              })}
              className="px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-2xs"
              title="Replay PGN Match"
              aria-label="Replay match"
            >
              <Play size={13} fill="currentColor" />
              <span className="hidden sm:inline">Replay</span>
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="w-full max-w-350 mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 text-slate-900 dark:text-white animate-in fade-in duration-300">
      {/* Return to Dashboard */}
      <button 
        type="button"
        onClick={() => void navigate('/menu')} 
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
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80">
              <th className="py-4 px-3 sm:px-6">Opponent</th>
              <th className="py-4 px-2 sm:px-6 text-center w-24 sm:w-28 whitespace-nowrap">Outcome</th>
              <th className="hidden md:table-cell py-4 px-6 text-center">Result Type</th>
              <th className="hidden sm:table-cell py-4 px-6 text-center">Date</th>
              <th className="hidden lg:table-cell py-4 px-8 text-right">Match ID</th>
              <th className="py-4 px-2 sm:px-6 text-center w-14 sm:w-24 whitespace-nowrap">Replay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/50">
            {renderTableContent()}
          </tbody>
        </table>
      </div>

      {/* Notice */}
      <div className="flex items-center gap-2 mt-4 text-[11px] font-medium text-slate-500 dark:text-slate-400 px-1">
        <Bot size={14} className="text-indigo-500 shrink-0" />
        <span>AI practice matches do not impact your ELO rating.</span>
      </div>

      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          disabled={isLoading}
        />
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
};

export default AllMatchHistory;
