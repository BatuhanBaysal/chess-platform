import { useState, useEffect, useCallback } from 'react';
import { useChess } from './hooks/useChess';
import { useAuth } from './hooks/useAuth';
import AuthCard from './components/AuthCard';
import ChessBoard from './components/ChessBoard';
import LandingPage from './components/LandingPage';
import { Sun, Moon, LogOut, Hash, LayoutDashboard } from 'lucide-react';

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
      if (user.id) {
        localStorage.setItem('userId', String(user.id));
      }
    } else {
      localStorage.removeItem('userId');
    }
  }, [user]);

  useEffect(() => {
    if (game?.gameId && game.gameId !== gameConfig.roomId) {
      setGameConfig(prev => ({ ...prev, roomId: game.gameId }));
    }
  }, [game?.gameId]);

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
    if (window.confirm("Are you ready for a new engagement?")) {
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
      <div className="animate-pulse">Loading System...</div>
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
      <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center flex-col gap-6 text-slate-900 dark:text-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full" />
          <div className="absolute top-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Initializing Board</div>
          <div className="opacity-40 font-bold text-[8px] uppercase tracking-widest">Sector: {gameConfig.roomId || 'New Deployment'}</div>
        </div>
        <button 
          onClick={handleBackToMenu}
          className="mt-4 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          Cancel Deployment
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#020617] dark:text-white transition-colors duration-500">
      <button 
        onClick={() => setColorMode(p => p === 'dark' ? 'light' : 'dark')} 
        className="fixed top-6 right-6 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 z-[9999] hover:scale-110 active:scale-95 transition-all shadow-xl backdrop-blur-md"
      >
        {colorMode === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-600" />}
      </button>

      {view === 'MENU' ? (
        <LandingPage onStart={handleStartMatch} />
      ) : (
        <main className="flex flex-col items-center p-4 md:p-8 min-h-screen">
          <header className="mb-8 text-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-500 dark:from-white dark:to-slate-600">
              CHESS PLATFORM
            </h1>
            {(game?.gameId || gameConfig.roomId) && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Hash size={10} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Room: {game?.gameId || gameConfig.roomId}</span>
              </div>
            )}
          </header>

          <nav className="w-full max-w-[1550px] mb-8 px-4 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 p-3 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
            <button 
              onClick={handleBackToMenu} 
              className="group flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm"
            >
              <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform" />
              Exit to Menu
            </button>
            
            <div className="flex gap-8 items-center">
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] mb-0.5">Current Turn</span>
                <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                  {game?.currentTurn || "WHITE"}
                </span>
              </div>
              
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              <div className="hidden sm:flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-2xl">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{isConnected ? 'Link Stable' : 'Offline'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">Commander</p>
                <p className="text-[11px] font-black uppercase italic tracking-tight">{gameConfig.playerName}</p>
                {playerColor && <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{playerColor} SIDE</p>}
              </div>
              <button onClick={logout} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:text-rose-500 transition-all">
                <LogOut size={16} />
              </button>
            </div>
          </nav>

          <ChessBoard 
            boardRepresentation={game?.boardRepresentation || ""} 
            gameStatus={game?.status || "ACTIVE"}
            currentTurn={game?.currentTurn || "WHITE"} 
            moveHistory={game?.moveHistory || []} 
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
