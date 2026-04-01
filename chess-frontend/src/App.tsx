import { useState, useEffect } from 'react';
import { useChess } from './hooks/useChess';
import { useAuth } from './hooks/useAuth';
import AuthCard from './components/AuthCard';
import ChessBoard from './components/ChessBoard';
import LandingPage from './components/LandingPage';
import { Sun, Moon, LogOut } from 'lucide-react';

export type ChessTheme = 'classic' | 'modern' | 'emerald';
export type TimeControl = 3 | 10 | 30;

function App() {
  const { user, login, register, loginAsGuest, logout, loading: authLoading } = useAuth();
  const [view, setView] = useState<'MENU' | 'GAME'>('MENU');
  const [gameConfig, setGameConfig] = useState({
    playerName: '',
    theme: 'classic' as ChessTheme,
    timeControl: 10 as TimeControl
  });

  const [colorMode, setColorMode] = useState(() => 
    localStorage.getItem('chess_color_mode') || 'dark'
  );

  const { game, makeMove, isConnected, fetchLegalMoves, startNewGame } = useChess();

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
    if (user) setGameConfig(prev => ({ ...prev, playerName: user.username }));
  }, [user]);

  const handleStartMatch = (theme: ChessTheme, time: TimeControl) => {
    setGameConfig(prev => ({ ...prev, theme, timeControl: time }));
    setView('GAME');
    startNewGame();
  };

  const handleRestart = () => {
    if (window.confirm("Start new game?")) startNewGame();
  };

  if (authLoading) return <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center font-black uppercase text-xs">Loading...</div>;

  if (!user) {
    return (
      <AuthCard 
        colorMode={colorMode}
        setColorMode={setColorMode}
        onLogin={(u, p) => login({ username: u, password: p })} 
        onRegister={(u, p) => register({ username: u, password: p, email: `${u}@chess.com` })} 
        onGuestLogin={loginAsGuest} 
      />
    );
  }

  if (view === 'GAME' && (!game || !isConnected)) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-blue-500 font-mono animate-pulse font-black uppercase">Initializing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#020617] dark:text-white transition-colors duration-500">
      <button 
        onClick={() => setColorMode(p => p === 'dark' ? 'light' : 'dark')} 
        className="fixed top-6 right-6 p-3 rounded-2xl border dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 z-[9999] hover:scale-110 transition-transform shadow-xl"
      >
        {colorMode === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-600" />}
      </button>

      {view === 'MENU' ? (
        <LandingPage onStart={handleStartMatch} />
      ) : (
        <main className="flex flex-col items-center p-4 md:p-8 min-h-screen">
          <header className="mb-10 text-center">
            <h1 className="text-6xl font-black tracking-tighter">CHESS PLATFORM</h1>
          </header>

          <nav className="w-full max-w-[1550px] mb-8 px-4 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 p-3 rounded-[2rem] border dark:border-slate-800 shadow-xl backdrop-blur-md">
            <button onClick={() => setView('MENU')} className="px-5 py-2.5 rounded-xl border dark:border-slate-800 text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">← Menu</button>
            <div className="flex gap-6 items-center">
              <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400">Turn: {game?.currentTurn}</span>
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-black uppercase italic">{gameConfig.playerName}</span>
              <button onClick={logout} className="p-1 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
            </div>
          </nav>

          <ChessBoard 
            boardRepresentation={game?.boardRepresentation || ""} 
            gameStatus={game?.status || "ACTIVE"}
            currentTurn={game?.currentTurn || "WHITE"} 
            moveHistory={game?.moveHistory || []} 
            lastMoveMessage={game?.lastMoveMessage || ""} 
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
