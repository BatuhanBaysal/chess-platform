import React, { useState, useEffect, useMemo } from 'react';
import { Timer, LogOut, Cpu, ShieldCheck } from 'lucide-react';
import { EvaluationBar } from './EvaluationBar';
import type { HintResponse } from '@/api/gameService';

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
  game?: any;
}

export const MatchInfoPanel: React.FC<MatchInfoPanelProps> = ({
  orientation, currentTurn, isGameOver, whiteRemainingTimeMs, blackRemainingTimeMs,
  whiteCaptured, blackCaptured, pieceImages, formatTime, onDismissGame,
  score = 0, evaluationType = 'CP', hintData, isHintLoading, onGetHint,
  isMyTurn = true,
  whitePlayerName, blackPlayerName, game
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

  const storedUsername = useMemo(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('username') || '') : '';
  }, []);

  const isAiMatch = useMemo(() => {
    const g = game as any;
    if (!g) return false;
    if (g.gameType === 'AI' || g.isAi || g.vsAi || g.mode === 'AI') return true;
    if (g.blackPlayerId === null && !g.roomId) return true;
    return false;
  }, [game]);

  const getCandidateName = (color: 'WHITE' | 'BLACK'): string => {
    const isW = color === 'WHITE';
    const propName = isW ? whitePlayerName : blackPlayerName;
    if (propName && propName !== 'White Player' && propName !== 'Black Player') {
      return propName;
    }

    const g = game as any;
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
    } else {
      return (
        g.blackPlayerName ||
        g.blackUsername ||
        g.blackPlayerUsername ||
        g.blackPlayer?.username ||
        g.blackPlayer?.name ||
        g.blackUser?.username ||
        ''
      );
    }
  };

  const resolvedWhiteName = useMemo(() => {
    const candidate = getCandidateName('WHITE');
    if (candidate) return candidate;

    if (isWhiteOrientation) {
      return storedUsername || 'White Player';
    }

    if (isAiMatch) return 'Stockfish AI';

    const g = game as any;
    if (g?.opponentName || g?.opponentUsername || g?.opponent?.username) {
      return g.opponentName || g.opponentUsername || g.opponent.username;
    }
    if (g?.whitePlayerId) return `User #${g.whitePlayerId}`;
    return 'White Player';
  }, [whitePlayerName, game, isWhiteOrientation, storedUsername, isAiMatch]);

  const resolvedBlackName = useMemo(() => {
    const candidate = getCandidateName('BLACK');
    if (candidate) return candidate;

    if (!isWhiteOrientation) {
      return storedUsername || 'Black Player';
    }

    if (isAiMatch) return 'Stockfish AI';

    const g = game as any;
    if (g?.opponentName || g?.opponentUsername || g?.opponent?.username) {
      return g.opponentName || g.opponentUsername || g.opponent.username;
    }
    if (g?.blackPlayerId) return `User #${g.blackPlayerId}`;
    return 'Black Player';
  }, [blackPlayerName, game, isWhiteOrientation, storedUsername, isAiMatch]);

  const topColor = isWhiteOrientation ? 'BLACK' : 'WHITE';
  const topTime = isWhiteOrientation ? (blackRemainingTimeMs || 0) : (whiteRemainingTimeMs || 0);
  const topPlayerLabel = isWhiteOrientation ? resolvedBlackName : resolvedWhiteName;
  const isTopTurn = isWhiteOrientation ? isBlackTurn : isWhiteTurn;
  const topCaptured = isWhiteOrientation ? blackCaptured : whiteCaptured;
  const topInitial = (topPlayerLabel.charAt(0) || (topColor === 'WHITE' ? 'W' : 'B')).toUpperCase();

  const bottomColor = isWhiteOrientation ? 'WHITE' : 'BLACK';
  const bottomTime = isWhiteOrientation ? (whiteRemainingTimeMs || 0) : (blackRemainingTimeMs || 0);
  const bottomPlayerLabel = isWhiteOrientation ? resolvedWhiteName : resolvedBlackName;
  const isBottomTurn = isWhiteOrientation ? isWhiteTurn : isBlackTurn;
  const bottomCaptured = isWhiteOrientation ? whiteCaptured : blackCaptured;
  const bottomInitial = (bottomPlayerLabel.charAt(0) || (bottomColor === 'WHITE' ? 'W' : 'B')).toUpperCase();

  const getPlayerStyle = (isTurn: boolean, playerColor: 'WHITE' | 'BLACK') => {
    if (playerColor === 'WHITE') {
      return isTurn
        ? 'text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 animate-pulse shadow-xs'
        : 'text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-xs';
    } else {
      return isTurn
        ? 'text-rose-600 dark:text-rose-400 border-rose-500 bg-rose-500/10 dark:bg-rose-500/20 animate-pulse shadow-xs'
        : 'text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-xs';
    }
  };

  const handleCapturedImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, pieceChar: string) => {
    const target = e.currentTarget as HTMLImageElement;
    target.style.display = 'none';
    if (target.parentElement) {
      target.parentElement.innerHTML = `<span class="text-[14px] font-black font-mono opacity-50">${pieceChar}</span>`;
    }
  };

  return (
    <div className="w-full xl:w-80 bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between p-3.5 sm:p-4 shadow-sm h-full overflow-hidden transition-colors gap-3">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">Match & Engine</span>
        </div>
        {onDismissGame && !isGameOver && (
          <button onClick={onDismissGame} title="Dismiss Game" className="text-rose-500 hover:text-rose-600 transition-colors p-1 cursor-pointer">
            <LogOut size={14} />
          </button>
        )}
      </div>

      {/* Top Player Details */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs max-w-full">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${topColor === 'WHITE' ? 'bg-blue-600' : 'bg-rose-600'}`}>
            {topInitial}
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 max-w-36 truncate">
            {topPlayerLabel}
          </span>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono ${topColor === 'WHITE' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
            {topColor === 'WHITE' ? 'W' : 'B'}
          </span>
        </div>
        <div className={`text-[13px] font-black font-mono px-3 py-1 rounded-xl border transition-all ${getPlayerStyle(isTopTurn, topColor)}`}>
          {formatTime(topTime)}
        </div>
      </div>

      {/* Top Captured Pieces */}
      <div className="grid grid-cols-5 gap-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs min-h-12 overflow-hidden items-center justify-items-center">
        {topCaptured.map((p, i) => (
          <div key={i} className="w-6 h-6 flex items-center justify-center">
            <img 
              src={pieceImages[p]} 
              className="w-full h-full drop-shadow-md" 
              alt="cap" 
              onError={(e) => handleCapturedImageError(e, p)} 
            />
          </div>
        ))}
      </div>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800/80" />

      {/* Stockfish Engine Telemetry */}
      <div className="flex flex-col justify-between gap-1.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
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
          <div className="text-xl sm:text-2xl font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-indigo-900/40 py-1.5 px-3 rounded-xl border border-amber-500/30 tracking-widest text-center shadow-xs animate-in fade-in">
            {displayedHint.bestMoveUci}
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium min-h-7 flex items-center justify-center">
            Click below for an engine recommendation.
          </div>
        )}

        <button
          onClick={() => {
            if (isMyTurn && !isHintLoading) {
              onGetHint();
            }
          }}
          disabled={!isMyTurn || isHintLoading}
          className="min-h-10 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-black py-2 px-3 rounded-xl transition-all text-[10px] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider active:scale-95"
        >
          {isHintLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculating...
            </>
          ) : (
            <>🎯 Get Smart Hint</>
          )}
        </button>
      </div>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800/80" />

      {/* Bottom Captured Pieces */}
      <div className="grid grid-cols-5 gap-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs min-h-12 overflow-hidden items-center justify-items-center">
        {bottomCaptured.map((p, i) => (
          <div key={i} className="w-6 h-6 flex items-center justify-center">
            <img 
              src={pieceImages[p]} 
              className="w-full h-full drop-shadow-md" 
              alt="cap" 
              onError={(e) => handleCapturedImageError(e, p)} 
            />
          </div>
        ))}
      </div>

      {/* Bottom Player Details */}
      <div className="flex flex-col items-center gap-2">
        <div className={`text-[13px] font-black font-mono px-3 py-1 rounded-xl border transition-all ${getPlayerStyle(isBottomTurn, bottomColor)}`}>
          {formatTime(bottomTime)}
        </div>
        <div className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs max-w-full">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${bottomColor === 'WHITE' ? 'bg-blue-600' : 'bg-rose-600'}`}>
            {bottomInitial}
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 max-w-36 truncate">
            {bottomPlayerLabel}
          </span>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono ${bottomColor === 'WHITE' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
            {bottomColor === 'WHITE' ? 'W' : 'B'}
          </span>
        </div>
      </div>

      {/* Footer Signature */}
      <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 w-full flex-none">
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
