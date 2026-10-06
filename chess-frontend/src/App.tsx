import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
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
      const resolvedUsername = user.username || (user as any).name || (user as any).sub || 'User';
      setGameConfig((prev: GameConfig) => ({ ...prev, playerName: resolvedUsername }));
      if (user.id) localStorage.setItem('userId', String(user.id));
      if (resolvedUsername) localStorage.setItem('username', resolvedUsername);
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
    const response = await login({ usernameOrEmail: u, password: p });
    
    const rootData = (response as any)?.data || response;
    const userData = rootData?.user || rootData?.data || rootData;

    const username = userData?.username || userData?.name || u;
    const role = userData?.role || userData?.roles || rootData?.role;

    if (username) localStorage.setItem('username', username);
    if (role) localStorage.setItem('userRole', typeof role === 'string' ? role : JSON.stringify(role));
    if (userData?.id) localStorage.setItem('userId', String(userData.id));

    window.location.href = '/menu';
  };

  const handleRegister = async (u: string, p: string, e: string) => {
    await register({ username: u, password: p, email: e });
  };

  const handleGuestLoginInternal = async () => {
    const response = await loginAsGuest();
    const rootData = (response as any)?.data || response;
    const userData = rootData?.user || rootData?.data || rootData;

    const username = userData?.username || userData?.name || 'Guest';
    const role = userData?.role || userData?.roles || 'ROLE_GUEST';

    if (username) localStorage.setItem('username', username);
    if (role) localStorage.setItem('userRole', typeof role === 'string' ? role : JSON.stringify(role));
    if (userData?.id) localStorage.setItem('userId', String(userData.id));

    window.location.href = '/menu';
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

  return (
    <ErrorBoundary>
      <Layout 
        onBackToMenu={handleBackToMenu} 
        isInGame={Boolean(game?.gameId)} 
      >
        <Routes>
          <Route path="/login" element={
            <AuthCard 
              onLogin={handleLogin} 
              onRegister={handleRegister} 
              onGuestLogin={handleGuestLoginInternal} 
            />
          } />
          <Route path="/register" element={
            <AuthCard 
              onLogin={handleLogin} 
              onRegister={handleRegister} 
              onGuestLogin={handleGuestLoginInternal} 
            />
          } />
          <Route path="/*" element={
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
              onLogin={(creds) => handleLogin(creds.usernameOrEmail, creds.password)}
              onRegister={(data) => handleRegister(data.username, data.password, data.email)}
              onGuestLogin={handleGuestLoginInternal}
            />
          } />
        </Routes>
      </Layout>
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;
