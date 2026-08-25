import React, { useEffect, useRef } from 'react';
import { Trophy, ArrowLeft, AlertCircle } from 'lucide-react';

interface GameOverModalProps {
  show: boolean;
  endGameReason: string;
  isTimeoutOrDismissed: boolean;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ show, endGameReason, isTimeoutOrDismissed, onBackToMenu }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-8 border border-yellow-500/20 ring-8 ring-yellow-500/5">
          {isTimeoutOrDismissed ? <AlertCircle size={48} className="text-yellow-500 animate-bounce" /> : <Trophy size={48} className="text-yellow-500 animate-bounce" />}
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter italic">{endGameReason}</h2>
        <div className="flex items-center gap-4 mt-4">
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
