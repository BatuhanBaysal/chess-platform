import React, { useState, useEffect } from 'react';
import { useChess } from './hooks/useChess';
import ChessBoard from './components/ChessBoard';
import LandingPage from './components/LandingPage';
import { Sun, Moon } from 'lucide-react';

export type ChessTheme = 'classic' | 'modern' | 'emerald';
export type TimeControl = 3 | 10 | 30;

function App() {
  const [view, setView] = useState<'MENU' | 'GAME'>('MENU');
  const [gameConfig, setGameConfig] = useState({
    playerName: '',
    theme: 'classic' as ChessTheme,
    timeControl: 10 as TimeControl
  });

  // Dark/Light mode state sync with localStorage
  const [colorMode, setColorMode] = useState(() => 
    localStorage.getItem('chess_color_mode') || 'dark'
  );

  const { game, makeMove, isConnected, fetchLegalMoves, startNewGame } = useChess();

  useEffect(() => {
    const html = window.document.documentElement;
    colorMode === 'dark' ? html.classList.add('dark') : html.classList.remove('dark');
    localStorage.setItem('chess_color_mode', colorMode);
  }, [colorMode]);

  const handleStartMatch = (name: string, theme: ChessTheme, time: TimeControl) => {
    setGameConfig({ playerName: name, theme, timeControl: time });
    setView('GAME');
  };

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to start a new game?")) {
      startNewGame();
    }
  };

  // Loading state when transitioning to game
  if (view === 'GAME' && !game) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-blue-500 font-mono animate-pulse text-xl tracking-widest uppercase">
            Initializing Engine...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-white transition-colors duration-500 overflow-x-hidden">
      
      {/* Global Theme Toggle */}
      <button 
        onClick={() => setColorMode(prev => prev === 'dark' ? 'light' : 'dark')}
        className="fixed top-6 right-6 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md hover:scale-110 transition-all z-[9999] shadow-xl"
      >
        {colorMode === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-600" />}
      </button>

      {view === 'MENU' ? (
        <LandingPage onStart={handleStartMatch} />
      ) : (
        <main className="flex flex-col items-center justify-start p-4 md:p-8 min-h-screen">
          
          <header className="z-10 text-center mb-10">
            <h1 className="text-6xl font-black tracking-tighter mb-1 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-500 dark:from-white dark:to-slate-500">
              CHESS CORE
            </h1>
            <p className="text-[9px] font-black tracking-[0.5em] uppercase opacity-40">Architectural Strategic Interface</p>
          </header>

          {/* Unified Navigation & Status Bar */}
          <nav className="z-20 w-full max-w-[1550px] mb-8 px-4 shrink-0">
            <div className="flex flex-row items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 px-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-500">
              
              {/* Navigation Actions */}
              <div className="flex-1 flex justify-start">
                <button 
                  onClick={() => setView('MENU')}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-95"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Main Menu
                </button>
              </div>

              {/* Live Game Status */}
              <div className={`flex-1 flex justify-center items-center gap-6 px-8 py-2 rounded-2xl transition-colors duration-500
                ${game!.status === 'CHECK' || game!.status === 'CHECKMATE' ? 'bg-red-500/10' : 'bg-transparent'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Turn:</span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {game!.currentTurn}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/50" />
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${game!.status !== 'ACTIVE' ? 'text-red-500 animate-pulse' : ''}`}>
                    {game!.status}
                  </span>
                </div>
              </div>

              {/* User Identity & System Connection */}
              <div className="flex-1 flex justify-end">
                <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-slate-800/40 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Identity</span>
                    <span className="text-[11px] font-black uppercase tracking-widest italic">{gameConfig.playerName}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
                  <div className="relative flex items-center justify-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    {isConnected && <div className="absolute w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75" />}
                  </div>
                </div>
              </div>

            </div>
          </nav>

          <ChessBoard 
            boardRepresentation={game!.boardRepresentation} 
            gameStatus={game!.status}
            currentTurn={game!.currentTurn} 
            moveHistory={game!.moveHistory || []} 
            lastMoveMessage={game!.lastMoveMessage || ""}
            onMove={makeMove} 
            fetchLegalMoves={fetchLegalMoves}
            onNewGame={handleRestart}
            theme={gameConfig.theme}
            timeLimit={gameConfig.timeControl}
          />
        </main>
      )}
    </div>
  );
}

export default App;
