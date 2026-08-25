import { useState, useCallback, useRef } from 'react';
import { useChessTimer } from './useChessTimer';
import { useChessSocket } from './useChessSocket';
import { useChessActions } from './useChessActions';

export const useChess = () => {
  const [playerColor, setPlayerColor] = useState<'WHITE' | 'BLACK' | null>(null);
  const gameIdRef = useRef<string | null>(null);

  const getAuthDetails = useCallback(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    let userId: number | null = null;
    try {
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userId = parsed.id || null;
      }
    } catch (e) {
      console.error(e);
    }
    return { token, userId, headers: token ? { 'Authorization': `Bearer ${token}` } : {} };
  }, []);

  const syncPlayerColor = useCallback((data: any) => {
    const { userId } = getAuthDetails();
    if (userId !== null && data) {
      if (data.whiteId && Number(data.whiteId) === Number(userId)) setPlayerColor('WHITE');
      else if (data.blackId && Number(data.blackId) === Number(userId)) setPlayerColor('BLACK');
    }
  }, [getAuthDetails]);

  const {
    isConnected,
    isLobbyConnected,
    stompClientRef,
    connectWebSocket: baseConnectWebSocket,
    disconnectWebSocket,
    connectLobby,
    disconnectLobby
  } = useChessSocket();

  const {
    game,
    setGame,
    error,
    setError,
    gameOverResult,
    setGameOverResult,
    isAiLoading,
    hintData,
    isHintLoading,
    evaluation,
    selectedTheme,
    setSelectedTheme,
    scheduleGameStateUpdate,
    makeMove,
    dismissGame,
    fetchLegalMoves,
    startNewGame,
    startAiGame,
    fetchHint,
    resetChessState: baseResetChessState
  } = useChessActions(
    stompClientRef,
    gameIdRef,
    getAuthDetails,
    syncPlayerColor,
    (id) => connectWebSocket(id),
    disconnectWebSocket,
    disconnectLobby
  );

  const { displayTime } = useChessTimer(game);

  if (game?.gameId) {
    gameIdRef.current = game.gameId;
  }

  const connectWebSocket = useCallback((gameId: string) => {
    gameIdRef.current = gameId;
    baseConnectWebSocket(
      gameId,
      getAuthDetails,
      (body) => scheduleGameStateUpdate(body),
      (result) => setGameOverResult(result),
      () => {
        setGameOverResult('DISMISSED');
        setGame((prev: any) => prev ? { ...prev, status: 'ABANDONED', isStarted: false } : null);
      },
      (err) => setError(err)
    );
  }, [baseConnectWebSocket, getAuthDetails, scheduleGameStateUpdate, setGameOverResult, setGame, setError]);

  const resetChessState = useCallback(async () => {
    gameIdRef.current = null;
    setPlayerColor(null);
    await baseResetChessState();
  }, [baseResetChessState]);

  const getBoardMatrix = useCallback(() => {
    if (!game?.boardRepresentation) return [];
    const rows = game.boardRepresentation.match(/.{1,8}/g) || [];
    return rows.map((row: string) => row.split(''));
  }, [game?.boardRepresentation]);

  return {
    game,
    displayTime,
    error,
    isConnected,
    isLobbyConnected,
    playerColor,
    gameOverResult,
    isAiLoading,
    hintData,
    isHintLoading,
    evaluation,
    selectedTheme,
    setSelectedTheme,
    connectWebSocket,
    disconnectWebSocket,
    connectLobby,
    disconnectLobby,
    makeMove,
    dismissGame,
    fetchLegalMoves,
    getBoardMatrix,
    startNewGame,
    startAiGame,
    fetchHint,
    resetChessState
  };
};
