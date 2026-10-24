import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Dashboard from './Dashboard';
import MatchHistory from './views/MatchHistory';
import GlobalLeaderboard from './panels/GlobalLeaderboard';
import api from '../../api/axios';
import { getActiveGame, createAiGame } from '../../api/gameService'; 
import type { GameResponse } from '../../api/gameService';
import { getMyProfile, type UserResponse } from '../../api/userService';

import { useLobby } from './hooks/useLobby';
import type { TimeControl } from './hooks/useLobby';
import { GameSetupPanel } from './panels/GameSetupPanel';
import { LobbyRoomsList } from './panels/LobbyRoomsList';
import { AiMatchModal } from './modals/AiMatchModal';
import { ReconnectAlert } from './components/ReconnectAlert';
import { DashboardHeroBanner } from './components/DashboardHeroBanner';
import { WaitingRoomModal } from './modals/WaitingRoomModal';
import { History, User, Bot, FileText, ChevronRight } from 'lucide-react';

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
  const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPlayAsWhite, setAiPlayAsWhite] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState(3);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('preferred_theme');
    if (savedTheme) {
      setSelectedTheme(savedTheme as any);
    }
  }, [setSelectedTheme]);

  useEffect(() => {
    if (selectedTheme) {
      localStorage.setItem('preferred_theme', String(selectedTheme));
    }
  }, [selectedTheme]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        getMyProfile()
          .then(setUserProfile)
          .catch((err) => console.error("Banner profile fetch error:", err));

        const activeGame = await getActiveGame(Number(user.id));
        if (activeGame && (activeGame.status as string) !== 'CLOSING') {
          const dismissedGames: string[] = JSON.parse(localStorage.getItem('dismissed_games') || '[]');
          const justResigned = localStorage.getItem('just_resigned') === 'true';

          if (justResigned) {
            localStorage.removeItem('just_resigned');
            if (!dismissedGames.includes(activeGame.gameId)) {
              dismissedGames.push(activeGame.gameId);
              localStorage.setItem('dismissed_games', JSON.stringify(dismissedGames));
            }
            return;
          }

          if (!dismissedGames.includes(activeGame.gameId)) {
            setReconnectGame(activeGame);
          }
        }
      }
    };
    fetchUserData();
  }, [user]);

  const totalGames = useMemo(() => {
    if (!userProfile) return 0;
    return (userProfile.totalWins || 0) + (userProfile.totalLosses || 0) + (userProfile.totalDraws || 0);
  }, [userProfile]);

  const handleStartGame = useCallback((roomId: string, time?: number, customTheme?: any) => {
    setWaitingRoomId(null);
    setReconnectGame(null);
    const chosenTheme = customTheme || selectedTheme;
    localStorage.setItem('preferred_theme', chosenTheme);
    onStart(chosenTheme, (time as TimeControl) || selectedTime, roomId);
    navigate('/game');
  }, [navigate, onStart, selectedTheme, selectedTime, setWaitingRoomId]);

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      {reconnectGame && (
        <ReconnectAlert 
          reconnectGame={reconnectGame}
          onReconnect={() => handleStartGame(reconnectGame.gameId, reconnectGame.timeLimit ?? undefined)}
          onDismiss={() => {
            const dismissedGames: string[] = JSON.parse(localStorage.getItem('dismissed_games') || '[]');
            if (!dismissedGames.includes(reconnectGame.gameId)) {
              dismissedGames.push(reconnectGame.gameId);
              localStorage.setItem('dismissed_games', JSON.stringify(dismissedGames));
            }
            setReconnectGame(null);
          }}
        />
      )}

      {/* Dashboard Hero Banner */}
      <DashboardHeroBanner 
        username={userProfile?.username || user?.username || localStorage.getItem('username') || 'Player'}
        eloRating={userProfile?.eloRating ?? null}
        totalGames={totalGames}
        onQuickMatch={() => {
          setSelectedTime(10);
          handleCreateRoom();
        }}
        isCreating={isCreating}
      />

      {/* Full-Screen Gated Modals */}
      <WaitingRoomModal 
        waitingRoomId={waitingRoomId}
        selectedTime={selectedTime}
        selectedTheme={selectedTheme}
        onCancel={handleCancelDeployment}
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

      {/* Game Setup & Active Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col h-auto lg:h-full">
          <GameSetupPanel
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            isCreating={isCreating}
            onCreateRoom={handleCreateRoom}
            onOpenAiModal={() => setShowAiModal(true)}
          />
        </div>
        <div className="lg:col-span-4 flex flex-col h-auto lg:h-full">
          <LobbyRoomsList 
            rooms={rooms} 
            onJoinRoom={handleJoinRoom} 
          />
        </div>
      </div>

      {/* Player Dashboard & Top Players */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col h-auto lg:h-full">
          <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-sm h-full flex flex-col justify-between">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider mb-5 text-slate-950 dark:text-white">
              PLAYER DASHBOARD
            </h2>
            {user && <Dashboard userId={user.id} activeLobbyId={waitingRoomId} />}
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col h-auto lg:h-full">
          <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-sm h-full flex flex-col justify-between">
            <GlobalLeaderboard />
          </div>
        </div>
      </div>

      {/* Match History & Platform Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col h-auto lg:h-full">
          <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-sm h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <History className="text-indigo-600 dark:text-indigo-400" size={18} />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950 dark:text-white">
                  MATCH HISTORY
                </h2>
              </div>
              <button 
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  navigate('/history');
                }}
                className="min-h-11 px-3 flex items-center text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                VIEW ALL &gt;
              </button>
            </div>

            {user && (
              <MatchHistory ref={matchHistoryRef} userId={user.id} limit={5} />
            )}
          </div>
        </div>

        {/* Quick Navigation Platform Hub */}
        <div className="lg:col-span-4 flex flex-col h-auto lg:h-full">
          <div className="relative w-full h-full min-h-85 sm:min-h-95 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800/80 bg-slate-950 p-6 sm:p-8 flex flex-col justify-between">
            <img
              src="/assets/images/chess-platform.jpg"
              alt="Chess Platform Arena"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-65 pointer-events-none"
            />
            <div className="absolute inset-0 bg-linear-to-b from-slate-950/70 via-slate-950/50 to-slate-950/95 pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                PLATFORM HUB
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                v2.6.0
              </span>
            </div>

            {/* 3 Full-Height Navigation Cards */}
            <div className="relative z-10 flex-1 flex flex-col justify-between gap-3 sm:gap-4 py-3">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  navigate('/about');
                }}
                className="flex-1 min-h-18 sm:min-h-20 flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 border-indigo-400/40 bg-slate-950/70 hover:bg-indigo-950/60 hover:border-indigo-400 backdrop-blur-md transition-all text-left group cursor-pointer shadow-md shadow-indigo-950/30"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                  <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <User size={20} />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="font-black text-sm sm:text-base text-white group-hover:text-indigo-300 transition-colors truncate">
                      About Developer
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300 mt-0.5 truncate">
                      Architecture & Background
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300 group-hover:text-white group-hover:translate-x-1 group-hover:bg-indigo-600 transition-all">
                  <ChevronRight size={16} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  navigate('/contact');
                }}
                className="flex-1 min-h-18 sm:min-h-20 flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 border-purple-400/40 bg-slate-950/70 hover:bg-purple-950/60 hover:border-purple-400 backdrop-blur-md transition-all text-left group cursor-pointer shadow-md shadow-purple-950/30"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                  <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Bot size={20} />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="font-black text-sm sm:text-base text-white group-hover:text-purple-300 transition-colors truncate">
                      Contact & Inquiries
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300 mt-0.5 truncate">
                      Direct Communication
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300 group-hover:text-white group-hover:translate-x-1 group-hover:bg-purple-600 transition-all">
                  <ChevronRight size={16} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  navigate('/changelog');
                }}
                className="flex-1 min-h-18 sm:min-h-20 flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 border-emerald-400/40 bg-slate-950/70 hover:bg-emerald-950/60 hover:border-emerald-400 backdrop-blur-md transition-all text-left group cursor-pointer shadow-md shadow-emerald-950/30"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                  <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="font-black text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors truncate">
                      Release Notes
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300 mt-0.5 truncate">
                      Changelog & History
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300 group-hover:text-white group-hover:translate-x-1 group-hover:bg-emerald-600 transition-all">
                  <ChevronRight size={16} />
                </div>
              </button>
            </div>

            <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>Single-Page Architecture</span>
              <span className="text-indigo-400 uppercase tracking-widest font-black">Explore Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
