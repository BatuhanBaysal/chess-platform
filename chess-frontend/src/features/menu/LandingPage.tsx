import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, Loader2, Sword, Shield, Clock, LayoutDashboard, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Dashboard from './Dashboard';
import MatchHistory from './MatchHistory';
import ChessBoard from '../../components/chess/ChessBoard';
import { useChess } from '../../hooks/useChess';
import api from '../../api/axios';
import { getActiveGame } from '../../api/gameService';
import type { GameResponse } from '../../api/gameService';

type ChessTheme = 'classic' | 'modern' | 'emerald';
type TimeControl = 3 | 10 | 30;

interface GameRoom {
  roomId: string;
  hostName: string;
  timeControl: number;
  theme?: ChessTheme;
}

interface LandingPageProps {
  onStart: (theme: ChessTheme, time: TimeControl, roomId?: string) => void;
}

const THEME_PREVIEWS = {
  classic: { dark: '#b58863', light: '#f0d9b5' },
  modern: { dark: '#4b7399', light: '#eae9d2' },
  emerald: { dark: '#6a8d5c', light: '#eceed1' }
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const {user, loginAsGuest } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<ChessTheme>('classic');
  const [selectedTime, setSelectedTime] = useState<TimeControl>(10);
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [waitingRoomId, setWaitingRoomId] = useState<string | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [reconnectGame, setReconnectGame] = useState<GameResponse | null>(null);

  const { 
    game, 
    isConnected, 
    playerColor, 
    makeMove, 
    fetchLegalMoves, 
    startNewGame, 
    resetChessState 
  } = useChess();

  useEffect(() => {
    const checkActiveGame = async () => {
      if (user?.id) {
        const activeGame = await getActiveGame(user.id);
        if (activeGame && activeGame.status !== 'CLOSING') {
          setReconnectGame(activeGame);
        }
      }
    };
    checkActiveGame();
  }, [user]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/api/lobby/rooms');
      setRooms(res.data);
    } catch (e) {
      console.error("Lobby Sync Error");
    }
  };

  const handleStartGame = useCallback((roomId: string, time?: number, theme?: ChessTheme) => {
    setWaitingRoomId(null);
    setReconnectGame(null);
    setActiveGameId(roomId);
    startNewGame(roomId);
    onStart(theme || selectedTheme, (time as TimeControl) || selectedTime, roomId);
  }, [onStart, selectedTheme, selectedTime, startNewGame]);

  const checkMatchStatus = async (roomId: string) => {
    try {
      const res = await api.get(`/api/lobby/status/${roomId}`);
      if (res.data.status === 'FULL' || res.data.status === 'IN_PROGRESS' || res.data.ready) {
        handleStartGame(roomId);
      }
    } catch (e) {
      console.error("Match Status Check Failed");
    }
  };

  useEffect(() => {
    fetchRooms();
    const lobbyInterval = setInterval(fetchRooms, 3000);
    let matchInterval: ReturnType<typeof setInterval> | undefined;
    if (waitingRoomId) {
      matchInterval = setInterval(() => checkMatchStatus(waitingRoomId), 2000);
    }
    return () => {
      clearInterval(lobbyInterval);
      if (matchInterval) clearInterval(matchInterval);
    };
  }, [waitingRoomId]);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      let currentUser = user || await loginAsGuest();
      if (currentUser?.id) {
        const res = await api.post('/api/lobby/create', null, {
          params: { userId: currentUser.id, username: currentUser.username, time: selectedTime, theme: selectedTheme }
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

  const handleJoinRoom = async (room: GameRoom) => {
    try {
      let currentUser = user || await loginAsGuest();
      if (currentUser?.id) {
        await api.post('/api/lobby/join', null, {
          params: { roomId: room.roomId, userId: currentUser.id, username: currentUser.username }
        });
        if (room.theme) setSelectedTheme(room.theme);
        setSelectedTime(room.timeControl as TimeControl);
        handleStartGame(room.roomId, room.timeControl, room.theme);
      }
    } catch (e) {
      alert("Room is full or no longer exists.");
    }
  };

  if (activeGameId && game) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 pt-20 lg:pt-32 animate-in fade-in duration-500">
        <div className="w-full max-w-350 flex justify-between items-center mb-8 bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => { setActiveGameId(null); resetChessState(); }} 
                className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white"
              >
                <LayoutDashboard size={20} />
              </button>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Active Operations</h2>
                <p className="text-[10px] font-mono text-slate-500 uppercase">Sector: {activeGameId}</p>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'} animate-pulse`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                {isConnected ? 'Link Established' : 'Link Corrupted'}
              </span>
           </div>
        </div>
        <ChessBoard
          boardRepresentation={game.boardRepresentation}
          isStarted={game.isStarted}
          gameStatus={game.status}
          currentTurn={game.currentTurn}
          moveHistory={game.moveHistory}
          lastMoveMessage={game.lastMoveMessage}
          onMove={(f, r, tf, tr, prom) => makeMove(activeGameId, f, r, tf, tr, prom)}
          fetchLegalMoves={fetchLegalMoves}
          theme={selectedTheme}
          timeLimit={game.timeLimit || selectedTime} 
          orientation={playerColor || 'WHITE'}
          whiteRemainingTimeMs={game.whiteRemainingTimeMs}
          blackRemainingTimeMs={game.blackRemainingTimeMs}
          onBackToMenu={() => { setActiveGameId(null); resetChessState(); }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-350 mx-auto pt-20 pb-12 px-4 lg:px-8">
      {reconnectGame && (
        <div className="fixed bottom-10 right-10 z-110 animate-in slide-in-from-right-10 duration-500 w-[90%] max-w-xs">
          <div className="bg-blue-600 p-6 rounded-3xl shadow-2xl shadow-blue-500/40 border border-white/10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="text-white animate-spin-slow" size={20} />
              <span className="text-xs font-black uppercase tracking-widest text-white">Active Signal Found</span>
            </div>
            <p className="text-[10px] font-bold text-blue-100 uppercase opacity-80 leading-relaxed">
              You have a match in progress. Re-establish neural link to Sector {reconnectGame.gameId.substring(0,4)}?
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleStartGame(reconnectGame.gameId, reconnectGame.timeLimit)}
                className="flex-1 py-3 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all"
              >
                Reconnect
              </button>
              <button 
                onClick={() => setReconnectGame(null)}
                className="px-4 py-3 bg-blue-700 text-blue-200 rounded-xl text-[10px] font-black uppercase hover:bg-blue-800 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {waitingRoomId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-blue-500/30 shadow-2xl shadow-blue-500/10 text-center max-w-sm w-[90%]">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
              <Sword className="absolute inset-0 m-auto text-blue-500" size={30} />
            </div>
            <h2 className="text-xl font-black tracking-tighter mb-2 uppercase text-slate-900 dark:text-white">Searching Opponent</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-6">Room ID: {waitingRoomId}</p>
            <div className="flex items-center justify-center gap-4 py-3 px-6 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
              <div className="text-center">
                  <p className="text-[8px] font-black opacity-40 uppercase">Mode</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedTime} MIN</p>
               </div>
               <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
               <div className="text-center">
                  <p className="text-[8px] font-black opacity-40 uppercase">Theme</p>
                  <p className="text-xs font-bold uppercase text-slate-900 dark:text-white">{selectedTheme}</p>
               </div>
            </div>
            <button 
              onClick={() => setWaitingRoomId(null)}
              className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:opacity-70 transition-opacity"
            >
              Cancel Deployment
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch auto-rows-fr">
        <div className="flex flex-col gap-8">
          <div className="p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-xl">
            <div className="space-y-8">
              <section>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-3 text-slate-500 dark:text-slate-400 ml-1">
                  <Clock size={12} /> Time Control
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 10, 30].map(t => (
                    <button key={t} onClick={() => setSelectedTime(t as TimeControl)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${selectedTime === t ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300'}`}>
                      {t} MIN
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-3 text-slate-500 dark:text-slate-400 ml-1">Board Aesthetic</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['classic', 'modern', 'emerald'] as ChessTheme[]).map(theme => (
                    <button key={theme} onClick={() => setSelectedTheme(theme)} className={`relative p-3 rounded-2xl transition-all border-2 flex flex-col items-center gap-3 ${selectedTheme === theme ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5' : 'border-transparent bg-slate-50 dark:bg-slate-800/40'}`}>
                      <div className="w-10 h-10 grid grid-cols-2 rounded-lg overflow-hidden shadow-sm">
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].light }}></div>
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].dark }}></div>
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].dark }}></div>
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].light }}></div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-slate-900 dark:text-white">{theme}</span>
                    </button>
                  ))}
                </div>
              </section>
              <button 
                onClick={handleCreateRoom} 
                disabled={isCreating}
                className="w-full py-5 flex items-center justify-center gap-3 rounded-3xl font-black uppercase tracking-[0.3em] text-xs transition-all bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
                Initialize Match
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[3rem] p-6 shadow-lg flex flex-col grow">
            {user && <Dashboard userId={user.id} activeLobbyId={waitingRoomId} />}
          </div>
        </div>
        
        <div className="flex flex-col gap-8">
          <div className="p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-xl h-full flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={20} />
                  <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">Active Operations</h2>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{rooms.length} Channels Open</span>
                </div>
             </div>
             <div className="grow flex items-center justify-center">
                {rooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {rooms.map(room => (
                      <div key={room.roomId} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center group hover:border-blue-500 transition-all shadow-sm">
                        <div>
                          <p className="text-[10px] font-black opacity-40 uppercase tracking-widest text-slate-900 dark:text-white">Host</p>
                          <p className="font-bold text-slate-900 dark:text-white">{room.hostName}</p>
                          <div className="flex items-center gap-2 mt-1">
                              <Shield size={10} className="text-blue-500" />
                              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">{room.timeControl} MIN</p>
                          </div>
                        </div>
                        <button onClick={() => handleJoinRoom(room)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md transition-all active:scale-95">
                          Engage
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-20">
                        <Sword size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">No active combat signals detected...</p>
                  </div>
                )}
             </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[3rem] p-8 shadow-xl text-slate-900 dark:text-slate-200 flex flex-col grow">
            <h2 className="text-lg font-black uppercase tracking-widest mb-6">Deployment History</h2>
            <div className="grow overflow-y-auto">
              {user && <MatchHistory userId={user.id} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
