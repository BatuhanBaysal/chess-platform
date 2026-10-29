import React, { useEffect, useRef } from 'react';
import { Trophy, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

interface GameOverModalProps {
  show: boolean;
  gameStatus: string;
  currentTurn: string;
  orientation: 'WHITE' | 'BLACK';
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ 
  show, 
  gameStatus, 
  currentTurn, 
  orientation, 
  onBackToMenu 
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const upperStatus = (gameStatus || "").toUpperCase();
  const playerColor = orientation?.toUpperCase();
  const activeTurn = currentTurn?.toUpperCase();

  const getLoserColor = (): string => {
    if (upperStatus.includes('WHITE')) return 'WHITE';
    if (upperStatus.includes('BLACK')) return 'BLACK';
    return activeTurn;
  };

  const getEndGameTitle = () => {
    if (upperStatus.includes('DISMISSED') || upperStatus.includes('ABANDONED')) {
      return "Game Over";
    }
    if (upperStatus.includes('DRAW') || upperStatus.includes('STALEMATE')) {
      return "Draw!";
    }
    if (upperStatus.includes('TIMEOUT') || upperStatus.includes('RESIGN')) {
      const loser = getLoserColor();
      return loser === playerColor ? "Defeat!" : "Victory!";
    }
    if (upperStatus.includes('CHECKMATE')) {
      const isMyTurn = activeTurn === playerColor;
      return isMyTurn ? "Defeat!" : "Victory!";
    }
    return "Game Over";
  };

  const getEndGameDescription = () => {
    if (upperStatus.includes('DISMISSED') || upperStatus.includes('ABANDONED')) {
      return "The match was dismissed or abandoned.";
    }
    if (upperStatus.includes('STALEMATE')) {
      return "The game ended in a stalemate (no legal moves available).";
    }
    if (upperStatus.includes('DRAW')) {
      return "The game finished in a draw.";
    }
    if (upperStatus.includes('TIMEOUT')) {
      const loser = getLoserColor();
      return loser === playerColor 
        ? "Your time limit has expired." 
        : "Your opponent's time limit has expired.";
    }
    if (upperStatus.includes('CHECKMATE')) {
      const isMyTurn = activeTurn === playerColor;
      return isMyTurn ? "Your king has been checkmated." : "You checkmated your opponent's king!";
    }
    return "The match has concluded.";
  };

  const endTitle = getEndGameTitle();
  const endDescription = getEndGameDescription();
  const isVictory = endTitle === "Victory!";

  useEffect(() => {
    if (show) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      buttonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          onBackToMenu();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [show, onBackToMenu]);

  return (
    <div className={`fixed inset-0 z-500 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 transition-all duration-300 ${show ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className={`bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full transition-transform duration-300 ${show ? 'scale-100' : 'scale-95'}`}>
        
        {/* Status Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${isVictory ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
          {isVictory ? (
            <Trophy size={32} className="text-amber-500" />
          ) : (
            <AlertCircle size={32} className="text-rose-500" />
          )}
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white mb-2 uppercase tracking-tight">
          {endTitle}
        </h2>
        
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {endDescription}
        </p>

        {/* Action Button */}
        <button 
          ref={buttonRef} 
          onClick={onBackToMenu} 
          className="min-h-11 w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase text-xs tracking-wider transition-all shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95 mb-4"
        >
          <ArrowLeft size={16} /> Return to Menu
        </button>

        {/* Footer Signature */}
        <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 w-full">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>CHESS PLATFORM</span>
          </div>
          <span>BATUHAN BAYSAL • 2026</span>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
