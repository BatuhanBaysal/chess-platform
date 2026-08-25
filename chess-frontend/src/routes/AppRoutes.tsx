import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../features/menu/LandingPage';
import ProfileDashboard from '../features/user/ProfileDashboard';
import FullLeaderboardPage from '../features/menu/views/FullLeaderboardPage';
import AllMatchHistory from '../features/menu/views/AllMatchHistory';
import AdminDashboard from '../features/admin/AdminDashboard';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { ActiveGameView } from '../features/chess/components/ActiveGameView';
import type { ChessTheme, TimeControl } from '../App';

interface AppRoutesProps {
  user: any;
  game: any;
  isConnected: boolean;
  playerColor: string | null;
  gameConfig: { theme: ChessTheme; timeControl: TimeControl; roomId: string };
  hintData: any;
  isHintLoading: boolean;
  evaluation: { score: number; type: string };
  handleStartMatch: (theme: ChessTheme, time: TimeControl, roomId?: string) => void;
  handleBackToMenu: () => void;
  handleRestart: () => void;
  onMoveInternal: (fF: number, fR: number, tF: number, tR: number, p?: string) => void;
  fetchLegalMoves: (file: number, rank: number) => Promise<any>;
  fetchHint: (depth?: number) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  user,
  game,
  isConnected,
  playerColor,
  gameConfig,
  hintData,
  isHintLoading,
  evaluation,
  handleStartMatch,
  handleBackToMenu,
  handleRestart,
  onMoveInternal,
  fetchLegalMoves,
  fetchHint,
}) => {
  return (
    <Routes>
      <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="/" element={<LandingPage onStart={handleStartMatch} />} />
      <Route path="/profile" element={<ProfileDashboard />} />
      <Route path="/leaderboard" element={<FullLeaderboardPage />} />
      <Route path="/history" element={<AllMatchHistory userId={user?.id} />} />
      <Route 
        path="/game" 
        element={
          <ActiveGameView 
            game={game}
            isConnected={isConnected}
            playerColor={playerColor}
            gameConfig={gameConfig}
            hintData={hintData}
            isHintLoading={isHintLoading}
            evaluation={evaluation}
            onMove={onMoveInternal}
            fetchLegalMoves={fetchLegalMoves}
            onRestart={handleRestart}
            onBackToMenu={handleBackToMenu}
            fetchHint={fetchHint}
          />
        } 
      />

      <Route path="*" element={<LandingPage onStart={handleStartMatch} />} />
    </Routes>
  )
};
