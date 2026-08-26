import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Dashboard from './Dashboard';
import MatchHistory from './views/MatchHistory';
import GlobalLeaderboard from './panels/GlobalLeaderboard';
import api from '../../api/axios';
import { getActiveGame, createAiGame } from '../../api/gameService'; 
import type { GameResponse } from '../../api/gameService';

import { useLobby } from './hooks/useLobby';
import type { TimeControl } from './hooks/useLobby';
import { GameSetupPanel } from './panels/GameSetupPanel';
import { LobbyRoomsList } from './panels/LobbyRoomsList';
import { AiMatchModal } from './modals/AiMatchModal';
import { ReconnectAlert } from './components/ReconnectAlert';
import { WaitingRoomModal } from './modals/WaitingRoomModal';

interface LandingPageProps {
  onStart: (theme: any, time: TimeControl, roomId?: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { user, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const matchHistoryRef = useRef<{ refresh: () => void }>(null);

  const {
    rooms,
    isCreating,
    setIsCreating,
    waitingRoomId,
    setWaitingRoomId,
    selectedTheme,
    setSelectedTheme,
    selectedTime,
    setSelectedTime,
    handleCancelDeployment
  } = useLobby(user?.id ? String(user.id) : undefined);

  const [reconnectGame, setReconnectGame] = useState<GameResponse | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPlayAsWhite, setAiPlayAsWhite] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState(3);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('preferred_theme');
    if (savedTheme && savedTheme !== selectedTheme) {
      setSelectedTheme(savedTheme as any);
    }
  }, [setSelectedTheme]);

  useEffect(() => {
    if (selectedTheme) {
      localStorage.setItem('preferred_theme', String(selectedTheme));
    }
  }, [selectedTheme]);

  useEffect(() => {
    const checkActiveGame = async () => {
      if (user?.id) {
        const activeGame = await getActiveGame(Number(user.id));
        if (activeGame && activeGame.status !== 'CLOSING') {
          const dismissedGames = JSON.parse(localStorage.getItem('dismissed_games') || '[]');
          if (!dismissedGames.includes(activeGame.gameId)) {
            setReconnectGame(activeGame);
          }
        }
      }
    };
    checkActiveGame();
  }, [user]);

  const handleStartGame = (roomId: string, time?: number, customTheme?: any) => {
    setWaitingRoomId(null);
    setReconnectGame(null);
    const chosenTheme = customTheme || selectedTheme;
    localStorage.setItem('preferred_theme', chosenTheme);
    onStart(chosenTheme, (time as TimeControl) || selectedTime, roomId);
    navigate('/game');
  };

  const handleStartAiMatch = async () => {
    try {
      setIsAiLoading(true);
      let currentUser = user || await loginAsGuest();
      if (currentUser?.id) {
        localStorage.setItem('preferred_theme', String(selectedTheme));
        const aiGameData = await createAiGame(
          Number(currentUser.id), 
          aiPlayAsWhite, 
          aiDifficulty, 
          Number(selectedTime)
        );

        if (aiGameData && aiGameData.gameId) {
          setShowAiModal(false);
          onStart(selectedTheme, selectedTime, aiGameData.gameId);
          navigate('/game', { 
            state: { 
              isAiGame: true, 
              aiDifficulty, 
              aiPlayAsWhite, 
              selectedTime, 
              selectedTheme 
            } 
          });
        }
      }
    } catch (e) {
      console.error("AI game start error:", e);
      alert("Could not start AI game.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      let currentUser = user || await loginAsGuest();
      if (currentUser?.id) {
        localStorage.setItem('preferred_theme', String(selectedTheme));
        const res = await api.post('/api/lobby/create', {
          userId: currentUser.id,
          username: currentUser.username,
          time: selectedTime,
          theme: selectedTheme
        });
        const roomId = typeof res.data === 'string' ? res.data : (res.data.roomId || res.data.id);
        if (roomId) setWaitingRoomId(roomId); 
      }
    } catch (e) {
      alert("Could not create match.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (room: any) => {
    try {
      let currentUser = user || await loginAsGuest();
      if (currentUser?.id) {
        await api.post('/api/lobby/join', {
          roomId: room.roomId,
          userId: currentUser.id,
          username: currentUser.username,
          theme: selectedTheme 
        });
        
        setSelectedTime(room.timeLimit as TimeControl);
        handleStartGame(room.roomId, room.timeLimit, selectedTheme);
      }
    } catch (e) {
      alert("Room is full or no longer exists.");
    }
  };

  useEffect(() => {
    let matchInterval: ReturnType<typeof setInterval> | undefined;
    
    if (waitingRoomId) {
      matchInterval = setInterval(async () => {
        try {
          const res = await api.get(`/api/lobby/status/${waitingRoomId}`);
          if (!res.data || res.data.status === 'CANCELLED' || res.data.status === 'EXPIRED') {
            setWaitingRoomId(null);
          } else if (res.data.status === 'FULL' || res.data.status === 'IN_PROGRESS' || res.data.ready) {
            handleStartGame(waitingRoomId);
          }
        } catch (e) {
          setWaitingRoomId(null);
        }
      }, 2000);
    }

    return () => {
      if (matchInterval) clearInterval(matchInterval);
    };
  }, [waitingRoomId, handleStartGame, setWaitingRoomId]);

  return (
    <div className="w-full max-w-[70%] mx-auto pt-12 pb-12 space-y-8 text-slate-900 dark:text-slate-100">
      {reconnectGame && (
        <ReconnectAlert 
          reconnectGame={reconnectGame}
          onReconnect={() => handleStartGame(reconnectGame.gameId, reconnectGame.timeLimit)}
          onDismiss={() => {
            const dismissedGames = JSON.parse(localStorage.getItem('dismissed_games') || '[]');
            if (!dismissedGames.includes(reconnectGame.gameId)) {
              dismissedGames.push(reconnectGame.gameId);
              localStorage.setItem('dismissed_games', JSON.stringify(dismissedGames));
            }
            setReconnectGame(null);
          }}
        />
      )}

      <WaitingRoomModal 
        waitingRoomId={waitingRoomId}
        selectedTime={selectedTime}
        selectedTheme={selectedTheme}
        onCancel={handleCancelDeployment}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch auto-rows-fr">
        <GameSetupPanel
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          isCreating={isCreating}
          onCreateRoom={handleCreateRoom}
          onOpenAiModal={() => setShowAiModal(true)}
        />

        <AiMatchModal 
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          selectedTheme={selectedTheme}        
          setSelectedTheme={setSelectedTheme as any}  
          aiPlayAsWhite={aiPlayAsWhite}
          setAiPlayAsWhite={setAiPlayAsWhite}
          aiDifficulty={aiDifficulty}
          setAiDifficulty={setAiDifficulty}
          onStartMatch={handleStartAiMatch}
          isAiLoading={isAiLoading}
        />

        <LobbyRoomsList 
          rooms={rooms} 
          onJoinRoom={handleJoinRoom} 
        />
      </div>
      
      <div 
        onClick={() => navigate('/about')}
        className="relative w-full h-40 md:h-48 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800/60 cursor-pointer group bg-slate-900"
      >
        <img
          src="/assets/images/chess-platform.jpg"
          alt="Chess Platform Arena"
          className="w-full h-full object-cover object-center transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-8">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1 bg-indigo-500/10 px-3 py-0.5 rounded-full w-fit border border-indigo-500/20">
            Distributed Multiplayer
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
            Core Strategy & Ecosystem Architecture &rarr;
          </h2>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[3rem] p-8 shadow-sm">
        <GlobalLeaderboard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch auto-rows-fr">
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[3rem] p-8 shadow-sm">
          <h2 className="text-lg font-black uppercase tracking-widest mb-6 text-slate-900 dark:text-white">Command Center</h2>
          {user && <Dashboard userId={user.id} activeLobbyId={waitingRoomId} />}
        </div>
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[3rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">
              Deployment History
            </h2>
            <button 
              onClick={() => navigate('/history')}
              className="text-blue-500 hover:text-blue-400 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1"
            >
              View All &gt;
            </button>
          </div>

          {user && (
            <MatchHistory ref={matchHistoryRef} userId={user.id} limit={5} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
