import { useState, useEffect, useCallback } from 'react';
import { useChess } from './hooks/useChess';
import { useAuth } from './hooks/useAuth';
import AuthCard from './components/AuthCard';
import ChessBoard from './components/ChessBoard';
import LandingPage from './components/LandingPage';
import { Sun, Moon, LogOut, Hash, LayoutDashboard, Terminal } from 'lucide-react';

export type ChessTheme = 'classic' | 'modern' | 'emerald';
export type TimeControl = 3 | 10 | 30;

function App() {
  const { user, login, register, loginAsGuest, logout, loading: authLoading } = useAuth();
  const [view, setView] = useState<'MENU' | 'GAME'>('MENU');
  
  const [gameConfig, setGameConfig] = useState({
    playerName: '',
    theme: 'classic' as ChessTheme,
    timeControl: 10 as TimeControl,
    roomId: ''
  });

  const [colorMode, setColorMode] = useState(() => 
    localStorage.getItem('chess_color_mode') || 'dark'
  );

  const { 
    game, 
    makeMove, 
    isConnected, 
    fetchLegalMoves, 
    startNewGame, 
    playerColor, 
    resetChessState 
  } = useChess();

  useEffect(() => {
    const html = window.document.documentElement;
    if (colorMode === 'dark') {
      html.classList.add('dark');
      document.body.style.backgroundColor = "#020617";
    } else {
      html.classList.remove('dark');
      document.body.style.backgroundColor = "#ffffff";
    }
    localStorage.setItem('chess_color_mode', colorMode);
  }, [colorMode]);

  useEffect(() => {
    if (user) {
      setGameConfig(prev => ({ ...prev, playerName: user.username || 'Guest' }));
      if (user.id) localStorage.setItem('userId', String(user.id));
    } else {
      localStorage.removeItem('userId');
    }
  }, [user]);

  useEffect(() => {
    if (game?.gameId && game.gameId !== gameConfig.roomId) {
      setGameConfig(prev => ({ ...prev, roomId: game.gameId }));
    }
  }, [game?.gameId, gameConfig.roomId]);

  const handleBackToMenu = useCallback(() => {
    resetChessState();
    setGameConfig(prev => ({ ...prev, roomId: '' }));
    setView('MENU');
  }, [resetChessState]);

  const handleStartMatch = (theme: ChessTheme, time: TimeControl, roomId?: string) => {
    const targetRoomId = roomId && roomId.trim() !== "" ? roomId : undefined;
    setGameConfig(prev => ({ 
      ...prev, 
      theme, 
      timeControl: time, 
      roomId: targetRoomId || '' 
    }));
    setView('GAME');
    startNewGame(targetRoomId);
  };

  const handleRestart = () => {
    if (window.confirm("Initialize new deployment cycle? All current progress will be purged.")) {
      resetChessState(); 
      setGameConfig(prev => ({ ...prev, roomId: '' }));
      startNewGame(undefined); 
    }
  };

  const onMoveInternal = (fF: number, fR: number, tF: number, tR: number, p?: string) => {
    const activeRoomId = game?.gameId || gameConfig.roomId;
    if (activeRoomId) {
      makeMove(activeRoomId, fF, fR, tF, tR, p);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center font-black uppercase text-xs tracking-widest opacity-50">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
        <span>Syncing Credentials</span>
      </div>
    </div>
  );

  if (!user) {
    return (
      <AuthCard 
        colorMode={colorMode}
        setColorMode={setColorMode}
        onLogin={(u, p) => { login({ username: u, password: p }); }} 
        onRegister={(u, p) => { register({ username: u, password: p, email: `${u}@chess.com` }); }} 
        onGuestLogin={() => { loginAsGuest(); }} 
      />
    );
  }

  if (view === 'GAME' && (!game || !isConnected)) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center flex-col gap-8 text-slate-900 dark:text-white">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border-2 border-blue-500/10 rounded-full" />
          <div className="absolute w-20 h-20 border-t-2 border-blue-500 rounded-full animate-spin" />
          <Terminal size={32} className="text-blue-500 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-blue-500 font-black uppercase text-[11px] tracking-[0.5em] animate-pulse">Initializing Board Engine</div>
          <div className="px-4 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700">
             <span className="opacity-40 font-bold text-[9px] uppercase tracking-widest">Sector: {gameConfig.roomId || 'Auto-Generating'}</span>
          </div>
        </div>
        <button 
          onClick={handleBackToMenu}
          className="mt-4 group flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
        >
          Abort Deployment
        </button>
      </div>
    );
  }

  const statusUpper = game?.status?.toUpperCase() || "";
  const isCheck = statusUpper === 'CHECK';
  const isCheckmate = statusUpper === 'CHECKMATE';
  const isDraw = statusUpper === 'STALEMATE' || statusUpper === 'DRAW';

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#020617] dark:text-white transition-colors duration-500 selection:bg-blue-500 selection:text-white">
      <button 
        onClick={() => setColorMode(p => p === 'dark' ? 'light' : 'dark')} 
        className="fixed top-6 right-6 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 z-[9999] hover:scale-110 active:scale-95 transition-all shadow-xl backdrop-blur-md group"
      >
        {colorMode === 'dark' ? <Sun size={20} className="text-yellow-500 group-hover:rotate-45 transition-transform" /> : <Moon size={20} className="text-blue-600 group-hover:-rotate-12 transition-transform" />}
      </button>

      {view === 'MENU' ? (
        <LandingPage onStart={handleStartMatch} />
      ) : (
        <main className="flex flex-col items-center p-4 md:p-8 min-h-screen animate-in fade-in duration-700">
          <header className="mb-8 text-center">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-3 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-500 dark:from-white dark:to-slate-700">
              CHESS PLATFORM
            </h1>
            {(game?.gameId || gameConfig.roomId) && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
                <Hash size={12} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80">Sector: {game?.gameId || gameConfig.roomId}</span>
              </div>
            )}
          </header>

          <nav className="w-full max-w-[1550px] mb-8 px-6 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl transition-all">
            <button 
              onClick={handleBackToMenu} 
              className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm"
            >
              <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform" />
              Menu
            </button>
            
            <div className="flex gap-10 items-center">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-0.5">Tactical Turn</span>
                <span className={`text-[12px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${game?.currentTurn === 'WHITE' ? 'text-slate-900 dark:text-white' : 'text-blue-500'}`}>
                  {game?.currentTurn || "WHITE"}
                  {isCheck && <span className="text-red-500 animate-bounce text-[10px]">! CHECK</span>}
                  {isCheckmate && <span className="text-red-600 text-[10px]"># MATE</span>}
                  {isDraw && <span className="text-amber-500 text-[10px]">½ DRAW</span>}
                </span>
              </div>
              
              <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />

              <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isConnected ? 'bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">{isConnected ? 'System Stable' : 'Link Failed'}</span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">Commander</p>
                <p className="text-[12px] font-black uppercase italic tracking-tight text-blue-500 dark:text-blue-400">{gameConfig.playerName}</p>
                {playerColor && (
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-0.5">
                    {playerColor} ALLIANCE
                  </p>
                )}
              </div>
              <button 
                onClick={logout} 
                title="Terminate Session"
                className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-rose-500 hover:text-white transition-all group"
              >
                <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          </nav>

          <ChessBoard 
            boardRepresentation={game?.boardRepresentation || ""} 
            isStarted={game?.isStarted || false}
            gameStatus={game?.status || "ACTIVE"}
            currentTurn={game?.currentTurn || "WHITE"} 
            moveHistory={game?.humanReadableHistory || game?.moveHistory || []} 
            lastMoveMessage={game?.lastMoveMessage || ""} 
            onMove={onMoveInternal} 
            fetchLegalMoves={fetchLegalMoves}
            onNewGame={handleRestart}
            onBackToMenu={handleBackToMenu} 
            theme={gameConfig.theme}
            timeLimit={gameConfig.timeControl}
            orientation={playerColor || 'WHITE'}
          />
        </main>
      )}
    </div>
  );
}

export default App;
