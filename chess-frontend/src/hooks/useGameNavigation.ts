import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ChessTheme, TimeControl } from '../App';

interface GameConfig {
  playerName: string;
  theme: ChessTheme;
  timeControl: TimeControl;
  roomId: string;
}

export const useGameNavigation = (resetChessState: () => void, startNewGame: (roomId?: string) => void) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [gameConfig, setGameConfig] = useState<GameConfig>({
    playerName: '',
    theme: 'classic',
    timeControl: 10,
    roomId: ''
  });

  const handleBackToMenu = useCallback(() => {
    resetChessState();
    setGameConfig((prev: GameConfig) => ({ ...prev, roomId: '' }));
    if (location.pathname !== '/') navigate('/');
  }, [resetChessState, location.pathname, navigate]);

  const handleStartMatch = useCallback((theme: ChessTheme, time: TimeControl, roomId?: string) => {
    const targetRoomId = roomId && roomId.trim() !== "" ? roomId : undefined;
    setGameConfig((prev: GameConfig) => ({ ...prev, theme, timeControl: time, roomId: targetRoomId || '' }));
    if (location.pathname !== '/') navigate('/');
    startNewGame(targetRoomId);
  }, [location.pathname, navigate, startNewGame]);

  const handleRestart = useCallback(() => {
    if (window.confirm("Initialize new deployment cycle? All current progress will be purged.")) {
      resetChessState();
      setGameConfig((prev: GameConfig) => ({ ...prev, roomId: '' }));
      startNewGame(undefined); 
    }
  }, [resetChessState, startNewGame]);

  return {
    gameConfig,
    setGameConfig,
    handleBackToMenu,
    handleStartMatch,
    handleRestart
  };
};
