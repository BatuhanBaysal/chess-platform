import React, { useEffect, useRef } from 'react';
import { Trophy, ArrowLeft, AlertCircle } from 'lucide-react';

interface GameOverModalProps {
  show: boolean;
  gameStatus: string;
  currentTurn: string;
  orientation: 'WHITE' | 'BLACK';
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ show, gameStatus, currentTurn, orientation, onBackToMenu }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const upperStatus = (gameStatus || "").toUpperCase();
  
  const isTimeoutOrDismissed = 
    upperStatus.includes('TIMEOUT') || 
    upperStatus.includes('DISMISSED') || 
    upperStatus.includes('ABANDONED');

  const getEndGameTitle = () => {
    if (upperStatus.includes('DISMISSED') || upperStatus.includes('ABANDONED')) {
      return "Game Over";
    }
    if (upperStatus.includes('DRAW') || upperStatus.includes('STALEMATE')) {
      return "Draw!";
    }
    if (upperStatus.includes('TIMEOUT')) {
      const loser = upperStatus.split('_')[1];
      return loser === orientation.toUpperCase() ? "Defeat!" : "Victory!";
    }
    if (upperStatus.includes('CHECKMATE')) {
      const isMyTurn = currentTurn?.toUpperCase() === orientation.toUpperCase();
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
      return "The time limit has expired for one of the players.";
    }
    if (upperStatus.includes('CHECKMATE')) {
      const isMyTurn = currentTurn?.toUpperCase() === orientation.toUpperCase();
      return isMyTurn ? "Your king has been checkmated." : "You checkmated your opponent's king!";
    }
    return "The match has concluded.";
  };

  const endTitle = getEndGameTitle();
  const endDescription = getEndGameDescription();

  useEffect(() => {
    if (show) {
      buttonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          onBackToMenu();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [show, onBackToMenu]);

  return (
    <div className={`fixed inset-0 z-500 flex items-center justify-center bg-black/80 backdrop-blur-xl transition-all duration-500 ${show ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center text-center transition-transform duration-500 ${show ? 'scale-100' : 'scale-90'}`}>
        <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 ring-8 ring-yellow-500/5">
          {isTimeoutOrDismissed ? <AlertCircle size={48} className="text-yellow-500 animate-bounce" /> : <Trophy size={48} className="text-yellow-500 animate-bounce" />}
        </div>
        
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">{endTitle}</h2>
        
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
          {endDescription}
        </p>

        <div className="flex items-center gap-4">
          <button 
            ref={buttonRef} 
            onClick={onBackToMenu} 
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase text-[11px] tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <ArrowLeft size={16} /> Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
