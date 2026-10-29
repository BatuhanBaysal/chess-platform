import React, { useState, useEffect, useMemo } from 'react';
import { Timer, LogOut, Cpu, ShieldCheck, Bot } from 'lucide-react';
import { EvaluationBar } from './EvaluationBar';
import type { HintResponse } from '@/api/gameService';
import { getFullAvatarUrl, getUsernameAvatarUrl } from '@/utils/avatarUtils';

interface MatchInfoPanelProps {
  orientation: 'WHITE' | 'BLACK';
  currentTurn: string;
  isGameOver: boolean;
  whiteRemainingTimeMs?: number;
  blackRemainingTimeMs?: number;
  whiteCaptured: string[];
  blackCaptured: string[];
  pieceImages: { [key: string]: string };
  formatTime: (ms: number) => string;
  onDismissGame?: () => void;
  score?: number;
  evaluationType?: 'CP' | 'MATE';
  hintData: HintResponse | null;
  isHintLoading: boolean;
  onGetHint: () => void;
  isMyTurn?: boolean;
  whitePlayerName?: string;
  blackPlayerName?: string;
  whiteAvatarUrl?: string | null;
  blackAvatarUrl?: string | null;
  game?: any;
}

interface SidePlayerInput {
  name: string;
  time?: number;
  isTurn: boolean;
  captured: string[];
  avatarUrl?: string | null;
  gameAvatarUrl?: string | null;
}

const checkIsAiMatch = (g: any): boolean => {
  if (!g) return false;
  if (g.gameType === 'AI' || g.isAi || g.vsAi || g.mode === 'AI') return true;
  if (g.whiteId === -1 || g.blackId === -1 || g.whitePlayerId === -1 || g.blackPlayerId === -1) return true;
  return g.blackPlayerId === null && !g.roomId;
};

const getCandidateName = (
  color: 'WHITE' | 'BLACK',
  whitePlayerName?: string,
  blackPlayerName?: string,
  g?: any
): string => {
  const isW = color === 'WHITE';
  const propName = isW ? whitePlayerName : blackPlayerName;
  if (propName && propName !== 'White Player' && propName !== 'Black Player') {
    return propName;
  }
  if (!g) return '';

  if (isW) {
    return (
      g.whitePlayerName ||
      g.whiteUsername ||
      g.whitePlayerUsername ||
      g.whitePlayer?.username ||
      g.whitePlayer?.name ||
      g.whiteUser?.username ||
      ''
    );
  }
  return (
    g.blackPlayerName ||
    g.blackUsername ||
    g.blackPlayerUsername ||
    g.blackPlayer?.username ||
    g.blackPlayer?.name ||
    g.blackUser?.username ||
    ''
  );
};

const resolvePlayerName = (
  color: 'WHITE' | 'BLACK',
  candidate: string,
  isMyColor: boolean,
  isAi: boolean,
  storedUsername: string,
  g?: any
): string => {
  if (candidate) return candidate;

  const defaultFallback = color === 'WHITE' ? 'White Player' : 'Black Player';
  if (isMyColor) {
    return storedUsername || defaultFallback;
  }

  if (isAi) {
    const diff = g?.aiDifficulty;
    return diff ? `Stockfish (Lv. ${diff})` : 'Stockfish AI';
  }

  if (g?.opponentName || g?.opponentUsername || g?.opponent?.username) {
    return g.opponentName || g.opponentUsername || g.opponent.username;
  }
  const idVal = color === 'WHITE' ? (g?.whiteId ?? g?.whitePlayerId) : (g?.blackId ?? g?.blackPlayerId);
  if (idVal && idVal !== -1) {
    return `User #${idVal}`;
  }
  return defaultFallback;
};

const resolvePlayerAvatar = (
  directAvatar: string | null | undefined,
  gameAvatar: string | null | undefined,
  isAi: boolean,
  playerLabel: string
): string | undefined => {
  if (directAvatar) {
    return getFullAvatarUrl(directAvatar);
  }
  if (gameAvatar) {
    return getFullAvatarUrl(gameAvatar);
  }
  const isGuest = playerLabel.toLowerCase().startsWith('guest') || playerLabel === 'White Player' || playerLabel === 'Black Player';
  if (!isAi && !isGuest && playerLabel) {
    return getUsernameAvatarUrl(playerLabel);
  }
  return undefined;
};

const checkPlayerIsAi = (
  isAiMatch: boolean,
  color: 'WHITE' | 'BLACK',
  label: string,
  game?: any
): boolean => {
  if (!isAiMatch) return false;
  const isTargetAi = color === 'BLACK'
    ? (game?.blackId === -1 || game?.blackPlayerId === -1)
    : (game?.whiteId === -1 || game?.whitePlayerId === -1);
  return isTargetAi || label.toLowerCase().includes('stockfish') || label.toLowerCase().includes('bot');
};

const getPlayerInitial = (isAi: boolean, label: string, color: 'WHITE' | 'BLACK'): string => {
  if (isAi) return 'AI';
  return (label.charAt(0) || (color === 'WHITE' ? 'W' : 'B')).toUpperCase();
};

const getBadgeBg = (isAi: boolean, color: 'WHITE' | 'BLACK'): string => {
  if (isAi) return 'bg-amber-600';
  return color === 'WHITE' ? 'bg-blue-600' : 'bg-rose-600';
};

const getColorBadgeClass = (color: 'WHITE' | 'BLACK'): string => {
  return color === 'WHITE'
    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
};

const getPlayerStyle = (isTurn: boolean, playerColor: 'WHITE' | 'BLACK') => {
  if (playerColor === 'WHITE') {
    return isTurn
      ? 'text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 animate-pulse shadow-xs'
      : 'text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-xs';
  }
  return isTurn
    ? 'text-rose-600 dark:text-rose-400 border-rose-500 bg-rose-500/10 dark:bg-rose-500/20 animate-pulse shadow-xs'
    : 'text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-xs';
};

const getStoredUsername = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('username') || '';
};

const getSideTelemetry = (
  isTop: boolean,
  isWhiteOrientation: boolean,
  white: SidePlayerInput,
  black: SidePlayerInput,
  isAiMatch: boolean,
  game?: any
) => {
  const isTargetWhite = isTop ? !isWhiteOrientation : isWhiteOrientation;
  const current = isTargetWhite ? white : black;
  const color: 'WHITE' | 'BLACK' = isTargetWhite ? 'WHITE' : 'BLACK';
  const isAi = checkPlayerIsAi(isAiMatch, color, current.name, game);
  const initial = getPlayerInitial(isAi, current.name, color);
  const avatarSrc = resolvePlayerAvatar(current.avatarUrl, current.gameAvatarUrl, isAi, current.name);

  return {
    color,
    time: current.time || 0,
    label: current.name,
    isTurn: current.isTurn,
    captured: current.captured,
    isAi,
    initial,
    avatarSrc
  };
};

export const MatchInfoPanel: React.FC<MatchInfoPanelProps> = ({
  orientation, currentTurn, isGameOver, whiteRemainingTimeMs, blackRemainingTimeMs,
  whiteCaptured, blackCaptured, pieceImages, formatTime, onDismissGame,
  score = 0, evaluationType = 'CP', hintData, isHintLoading, onGetHint,
  isMyTurn = true,
  whitePlayerName, blackPlayerName,
  whiteAvatarUrl, blackAvatarUrl, game
}) => {
  const isWhiteTurn = currentTurn?.toUpperCase() === 'WHITE';
  const isBlackTurn = currentTurn?.toUpperCase() === 'BLACK';
  
  const [displayedHint, setDisplayedHint] = useState<HintResponse | null>(null);

  useEffect(() => {
    if (hintData) {
      setDisplayedHint(hintData);
      const timer = setTimeout(() => {
        setDisplayedHint(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [hintData]);

  const isWhiteOrientation = orientation === 'WHITE';
  const storedUsername = useMemo(() => getStoredUsername(), []);
  const isAiMatch = useMemo(() => checkIsAiMatch(game), [game]);

  const resolvedWhiteName = useMemo(() => {
    const candidate = getCandidateName('WHITE', whitePlayerName, blackPlayerName, game);
    return resolvePlayerName('WHITE', candidate, isWhiteOrientation, isAiMatch, storedUsername, game);
  }, [whitePlayerName, blackPlayerName, game, isWhiteOrientation, storedUsername, isAiMatch]);

  const resolvedBlackName = useMemo(() => {
    const candidate = getCandidateName('BLACK', whitePlayerName, blackPlayerName, game);
    return resolvePlayerName('BLACK', candidate, !isWhiteOrientation, isAiMatch, storedUsername, game);
  }, [blackPlayerName, whitePlayerName, game, isWhiteOrientation, storedUsername, isAiMatch]);

  const {
    color: topColor,
    time: topTime,
    label: topPlayerLabel,
    isTurn: isTopTurn,
    captured: topCaptured,
    isAi: isTopAi,
    initial: topInitial,
    avatarSrc: topAvatarSrc
  } = getSideTelemetry(
    true,
    isWhiteOrientation,
    { name: resolvedWhiteName, time: whiteRemainingTimeMs, isTurn: isWhiteTurn, captured: whiteCaptured, avatarUrl: whiteAvatarUrl, gameAvatarUrl: game?.whiteAvatarUrl },
    { name: resolvedBlackName, time: blackRemainingTimeMs, isTurn: isBlackTurn, captured: blackCaptured, avatarUrl: blackAvatarUrl, gameAvatarUrl: game?.blackAvatarUrl },
    isAiMatch,
    game
  );

  const {
    color: bottomColor,
    time: bottomTime,
    label: bottomPlayerLabel,
    isTurn: isBottomTurn,
    captured: bottomCaptured,
    isAi: isBottomAi,
    initial: bottomInitial,
    avatarSrc: bottomAvatarSrc
  } = getSideTelemetry(
    false,
    isWhiteOrientation,
    { name: resolvedWhiteName, time: whiteRemainingTimeMs, isTurn: isWhiteTurn, captured: whiteCaptured, avatarUrl: whiteAvatarUrl, gameAvatarUrl: game?.whiteAvatarUrl },
    { name: resolvedBlackName, time: blackRemainingTimeMs, isTurn: isBlackTurn, captured: blackCaptured, avatarUrl: blackAvatarUrl, gameAvatarUrl: game?.blackAvatarUrl },
    isAiMatch,
    game
  );

  const handleCapturedImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, pieceChar: string) => {
    const target = e.currentTarget as HTMLImageElement;
    target.style.display = 'none';
    if (target.parentElement) {
      target.parentElement.innerHTML = `<span class="text-[13px] font-black font-mono opacity-60">${pieceChar}</span>`;
    }
  };

  const handleHintButtonClick = () => {
    if (isMyTurn && !isHintLoading) {
      onGetHint();
    }
  };

  return (
    <div className="w-full xl:w-80 bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between p-3.5 sm:p-4 shadow-sm h-full transition-colors gap-2.5 sm:gap-3">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80 flex-none">
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">Match & Engine</span>
        </div>
        {onDismissGame && !isGameOver && (
          <button type="button" onClick={onDismissGame} title="Dismiss Game" className="text-rose-500 hover:text-rose-600 transition-colors p-1 cursor-pointer">
            <LogOut size={14} />
          </button>
        )}
      </div>

      {/* Top Player Details */}
      <div className="flex items-center justify-between gap-2 w-full flex-none">
        <div className="flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs min-w-0">
          <div className={`relative w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 overflow-hidden ${getBadgeBg(isTopAi, topColor)}`}>
            {isTopAi ? (
              <Bot size={13} />
            ) : (
              <>
                {topAvatarSrc && (
                  <img 
                    src={topAvatarSrc} 
                    alt={topPlayerLabel} 
                    className="w-full h-full object-cover z-10" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <span className="absolute z-0">{topInitial}</span>
              </>
            )}
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 truncate max-w-28 sm:max-w-32">
            {topPlayerLabel}
          </span>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ${getColorBadgeClass(topColor)}`}>
            {topColor === 'WHITE' ? 'W' : 'B'}
          </span>
        </div>
        <div className={`text-[12px] sm:text-[13px] font-black font-mono px-2.5 py-1 rounded-xl border transition-all shrink-0 ${getPlayerStyle(isTopTurn, topColor)}`}>
          {formatTime(topTime)}
        </div>
      </div>

      {/* Top Captured Pieces */}
      <div className="grid grid-cols-5 gap-1.5 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs min-h-9.5 items-center justify-items-center content-start transition-all">
        {topCaptured.map((p, i) => (
          <div key={`top-cap-${p}-${i}`} className="w-6 h-6 flex items-center justify-center">
            <img 
              src={pieceImages[p]} 
              className="w-full h-full drop-shadow-md object-contain" 
              alt="cap" 
              onError={(e) => handleCapturedImageError(e, p)} 
            />
          </div>
        ))}
      </div>

      <div className="w-full h-px bg-slate-200 dark:border-slate-800/80 flex-none" />

      {/* Stockfish Engine Telemetry */}
      <div className="flex flex-col justify-between gap-1.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex-none">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-indigo-300/90">
              Stockfish Analytics
            </span>
          </div>
        </div>

        <div className="p-0.5">
          <EvaluationBar score={score} evaluationType={evaluationType} orientation={orientation} />
        </div>

        {displayedHint ? (
          <div className="text-xl sm:text-2xl font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-indigo-900/40 py-1 px-3 rounded-xl border border-amber-500/30 tracking-widest text-center shadow-xs animate-in fade-in">
            {displayedHint.bestMoveUci}
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium min-h-6 flex items-center justify-center">
            Click below for an engine recommendation.
          </div>
        )}

        <button
          type="button"
          onClick={handleHintButtonClick}
          disabled={!isMyTurn || isHintLoading}
          className="min-h-9 sm:min-h-10 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-black py-2 px-3 rounded-xl transition-all text-[10px] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider active:scale-95"
        >
          {isHintLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Calculating...</span>
            </>
          ) : (
            <span>🎯 Get Smart Hint</span>
          )}
        </button>
      </div>

      <div className="w-full h-px bg-slate-200 dark:border-slate-800/80 flex-none" />

      {/* Bottom Captured Pieces */}
      <div className="grid grid-cols-5 gap-1.5 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs min-h-9.5 items-center justify-items-center content-start transition-all">
        {bottomCaptured.map((p, i) => (
          <div key={`bottom-cap-${p}-${i}`} className="w-6 h-6 flex items-center justify-center">
            <img 
              src={pieceImages[p]} 
              className="w-full h-full drop-shadow-md object-contain" 
              alt="cap" 
              onError={(e) => handleCapturedImageError(e, p)} 
            />
          </div>
        ))}
      </div>

      {/* Bottom Player Details */}
      <div className="flex items-center justify-between gap-2 w-full flex-none">
        <div className="flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs min-w-0">
          <div className={`relative w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 overflow-hidden ${getBadgeBg(isBottomAi, bottomColor)}`}>
            {isBottomAi ? (
              <Bot size={13} />
            ) : (
              <>
                {bottomAvatarSrc && (
                  <img 
                    src={bottomAvatarSrc} 
                    alt={bottomPlayerLabel} 
                    className="w-full h-full object-cover z-10" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <span className="absolute z-0">{bottomInitial}</span>
              </>
            )}
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 truncate max-w-28 sm:max-w-32">
            {bottomPlayerLabel}
          </span>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ${getColorBadgeClass(bottomColor)}`}>
            {bottomColor === 'WHITE' ? 'W' : 'B'}
          </span>
        </div>
        <div className={`text-[12px] sm:text-[13px] font-black font-mono px-2.5 py-1 rounded-xl border transition-all shrink-0 ${getPlayerStyle(isBottomTurn, bottomColor)}`}>
          {formatTime(bottomTime)}
        </div>
      </div>

      {/* Footer Signature */}
      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 w-full flex-none">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <ShieldCheck size={13} className="text-indigo-600 dark:text-indigo-400" />
          <span>CHESS PLATFORM</span>
        </div>
        <span>BATUHAN BAYSAL • 2026</span>
      </div>
    </div>
  );
};

export default MatchInfoPanel;
