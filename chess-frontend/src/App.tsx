import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useChess } from './features/chess/hooks/useChess.ts';
import { useAuth } from './hooks/useAuth';
import { useGameNavigation } from './hooks/useGameNavigation.ts';
import Layout from './components/common/Layout';
import AuthCard from './features/auth/AuthContainer';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export type ChessTheme = 'classic' | 'modern' | 'emerald';
export type TimeControl = 3 | 10 | 30;
export type AppView = 'MENU' | 'GAME' | 'PROFILE' | 'LEADERBOARD' | 'HISTORY' | 'ADMIN';

interface GameConfig {
  playerName: string;
  theme: ChessTheme;
  timeControl: TimeControl;
  roomId: string;
}

function App() {
  const { user, login, register, loginAsGuest, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); 

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

  const {
    gameConfig,
    setGameConfig,
    handleBackToMenu,
    handleStartMatch,
    handleRestart
  } = useGameNavigation(resetChessState, startNewGame);

  useEffect(() => {
    const savedTheme = localStorage.getItem('preferred_theme') as ChessTheme;
    if (savedTheme && ['classic', 'modern', 'emerald'].includes(savedTheme)) {
      setGameConfig((prev: GameConfig) => ({ ...prev, theme: savedTheme }));
    }
  }, [setGameConfig]);

  useEffect(() => {
    if (gameConfig?.theme) {
      localStorage.setItem('preferred_theme', gameConfig.theme);
    }
  }, [gameConfig?.theme]);

  useEffect(() => {
    if (user) {
      setGameConfig((prev: GameConfig) => ({ ...prev, playerName: user.username || 'Guest' }));
      if (user.id) localStorage.setItem('userId', String(user.id));
    } else {
      localStorage.removeItem('userId');
    }
  }, [user, setGameConfig]);

  useEffect(() => {
    if (game?.gameId && game.gameId !== gameConfig.roomId) {
      setGameConfig((prev: GameConfig) => ({ ...prev, roomId: game.gameId }));
    }
  }, [game?.gameId, gameConfig.roomId, setGameConfig]);
  
  useEffect(() => {
    if (game?.gameId && location.pathname !== '/game') {
      navigate('/game');
    }
  }, [game?.gameId, location.pathname, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.search]);

  const handleLogin = async (u: string, p: string) => {
    await login({ usernameOrEmail: u, password: p });
  };

  const handleRegister = async (u: string, p: string, e: string) => {
    await register({ username: u, password: p, email: e });
  };

  const onMoveInternal = (fF: number, fR: number, tF: number, tR: number, p?: string) => {
    const activeRoomId = game?.gameId || gameConfig.roomId;
    if (activeRoomId) makeMove(activeRoomId, fF, fR, tF, tR, p);
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
      <ErrorBoundary>
        <Routes>
          <Route path="/register" element={
            <AuthCard 
              onLogin={handleLogin} 
              onRegister={handleRegister} 
              onGuestLogin={loginAsGuest} 
            />
          } />
          <Route path="/login" element={
            <AuthCard 
              onLogin={handleLogin} 
              onRegister={handleRegister} 
              onGuestLogin={loginAsGuest} 
            />
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={
            <AuthCard 
              onLogin={handleLogin} 
              onRegister={handleRegister} 
              onGuestLogin={loginAsGuest} 
            />
          } />
        </Routes>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Layout 
        onBackToMenu={handleBackToMenu} 
        isInGame={Boolean(game?.gameId)} 
      >
        <AppRoutes 
          user={user}
          game={game}
          isConnected={isConnected}
          playerColor={playerColor}
          gameConfig={gameConfig}
          hintData={hintData}
          isHintLoading={isHintLoading}
          evaluation={evaluation}
          handleStartMatch={handleStartMatch}
          handleBackToMenu={handleBackToMenu}
          handleRestart={handleRestart}
          onMoveInternal={onMoveInternal}
          fetchLegalMoves={fetchLegalMoves}
          fetchHint={fetchHint}
        />
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
