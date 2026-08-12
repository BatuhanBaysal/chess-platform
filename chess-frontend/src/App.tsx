import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useChess } from './hooks/useChess';
import { useAuth } from './hooks/useAuth';
import Layout from './components/common/Layout';
import AuthCard from './features/auth/AuthContainer';
import ChessBoard from './components/chess/ChessBoard';
import LandingPage from './features/menu/LandingPage';
import ProfileDashboard from './features/user/ProfileDashboard';
import FullLeaderboardPage from './features/menu/FullLeaderboardPage';
import AllMatchHistory from './features/menu/AllMatchHistory';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import AdminDashboard from './features/admin/AdminDashboard';
import { Terminal } from 'lucide-react';

export type ChessTheme = 'classic' | 'modern' | 'emerald';
export type TimeControl = 3 | 10 | 30;

function App() {
  const { user, login, register, loginAsGuest, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState<'MENU' | 'GAME' | 'PROFILE' | 'LEADERBOARD' | 'HISTORY' | 'ADMIN'>(() => {
    return (localStorage.getItem('chess_current_view') as 'MENU' | 'GAME' | 'PROFILE' | 'LEADERBOARD' | 'HISTORY' | 'ADMIN') || 'MENU';
  });
  
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
    resetChessState,
    hintData,
    isHintLoading,
    fetchHint,
    evaluation
  } = useChess();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setView('ADMIN');
    } else if (view === 'ADMIN') {
      setView('MENU');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (view !== 'ADMIN') {
      localStorage.setItem('chess_current_view', view);
    }
  }, [view]);

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

  const handleLogin = async (u: string, p: string) => {
    await login({ username: u, password: p });
  };

  const handleRegister = async (u: string, p: string, e: string) => {
    await register({ username: u, password: p, email: e });
  };

  const handleBackToMenu = useCallback(() => {
    resetChessState();
    setGameConfig(prev => ({ ...prev, roomId: '' }));
    setView('MENU');
    if (location.pathname !== '/') {
      navigate('/');
    }
  }, [resetChessState, location.pathname, navigate]);

  const handleNavigateToProfile = useCallback(() => {
    setView('PROFILE');
    if (location.pathname !== '/') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  const handleStartMatch = (theme: ChessTheme, time: TimeControl, roomId?: string) => {
    const targetRoomId = roomId && roomId.trim() !== "" ? roomId : undefined;
    setGameConfig(prev => ({ 
      ...prev, 
      theme, 
      timeControl: time, 
      roomId: targetRoomId || '' 
    }));
    setView('GAME');
    if (location.pathname !== '/') {
      navigate('/');
    }
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
      <Routes>
        <Route path="*" element={
          <AuthCard 
            colorMode={colorMode}
            setColorMode={setColorMode}
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            onGuestLogin={loginAsGuest} 
          />
        } />
      </Routes>
    );
  }

  return (
    <Layout 
      colorMode={colorMode} 
      setColorMode={setColorMode}
      view={view}           
      onBackToMenu={handleBackToMenu}
      onNavigateToProfile={handleNavigateToProfile}
    >
      <Routes>
        <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={
          view === 'MENU' ? (
            <LandingPage onStart={handleStartMatch} setView={setView} />
          ) : view === 'PROFILE' ? (
            <ProfileDashboard />
          ) : view === 'ADMIN' ? (
            <AdminDashboard />
          ) : view === 'LEADERBOARD' ? (
            <FullLeaderboardPage onBack={() => setView('MENU')} />
          ) : view === 'HISTORY' ? (
            <AllMatchHistory userId={user.id} onBack={() => setView('MENU')} />
          ) : (!game || !isConnected) ? (
            <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center flex-col gap-8 text-slate-900 dark:text-white">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 border-2 border-blue-500/10 rounded-full" />
                <div className="absolute w-20 h-20 border-t-2 border-blue-500 rounded-full animate-spin" />
                <Terminal size={32} className="text-blue-500 animate-pulse" />
              </div>
              <button 
                onClick={handleBackToMenu}
                className="mt-4 group flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                Abort Deployment
              </button>
            </div>
          ) : (
            <main className="grow flex flex-col items-center justify-center w-full px-4 py-8">
              <div className="w-full max-w-4xl flex justify-center items-center">
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
                  whiteRemainingTimeMs={game?.whiteRemainingTimeMs ?? (gameConfig.timeControl * 60 * 1000)}
                  blackRemainingTimeMs={game?.blackRemainingTimeMs ?? (gameConfig.timeControl * 60 * 1000)}
                  hintData={hintData}
                  isHintLoading={isHintLoading}
                  onGetHint={() => fetchHint(10)} 
                  evaluationScore={evaluation.score}            
                  evaluationType={evaluation.type}
                  isMyTurn={game?.currentTurn?.toUpperCase() === (playerColor || 'WHITE').toUpperCase()}
                  game={game}
                />
              </div>
            </main>
          )
        } />
      </Routes>
    </Layout>
  );
}

export default App;
