import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Plus, Users, Loader2, Sword, Shield, Clock, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Dashboard from './Dashboard';
import MatchHistory from './MatchHistory';
import ChessBoard from './ChessBoard';
import { useChess } from '../hooks/useChess';
import api from '../api/axios';

type ChessTheme = 'classic' | 'modern' | 'emerald';
type TimeControl = 3 | 10 | 30;

interface GameRoom {
  roomId: string;
  hostName: string;
  timeControl: number;
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
  const { user, logout, loginAsGuest } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<ChessTheme>('classic');
  const [selectedTime, setSelectedTime] = useState<TimeControl>(10);
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [waitingRoomId, setWaitingRoomId] = useState<string | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const { 
    game, 
    isConnected, 
    playerColor, 
    makeMove, 
    fetchLegalMoves, 
    startNewGame, 
    resetChessState 
  } = useChess();

  const fetchRooms = async () => {
    try {
      const res = await api.get('/api/lobby/rooms');
      setRooms(res.data);
    } catch (e) {
      console.error("Lobby Sync Error");
    }
  };

  const handleStartGame = useCallback((roomId: string, time?: number) => {
    setWaitingRoomId(null);
    setActiveGameId(roomId);
    startNewGame(roomId);
    onStart(selectedTheme, (time as TimeControl) || selectedTime, roomId);
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
          params: { userId: currentUser.id, username: currentUser.username, time: selectedTime }
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
        handleStartGame(room.roomId, room.timeControl);
      }
    } catch (e) {
      alert("Room is full or no longer exists.");
    }
  };

  if (activeGameId && game) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 animate-in fade-in duration-500">
        <div className="w-full max-w-[1200px] flex justify-between items-center mb-8 bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => { setActiveGameId(null); resetChessState(); }} 
                className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white"
              >
                <LayoutDashboard size={20} />
              </button>
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-blue-500">Active Operation</h2>
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
          timeLimit={selectedTime}
          orientation={playerColor || 'WHITE'}
          onBackToMenu={() => { setActiveGameId(null); resetChessState(); }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 relative bg-slate-50 dark:bg-slate-950 overflow-x-hidden text-slate-900 dark:text-white">
      {waitingRoomId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-blue-500/30 shadow-2xl shadow-blue-500/10 text-center max-w-sm w-full mx-4">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
              <Sword className="absolute inset-0 m-auto text-blue-500" size={30} />
            </div>
            <h2 className="text-xl font-black tracking-tighter mb-2 uppercase">Searching Opponent</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Room ID: {waitingRoomId}</p>
            <div className="flex items-center justify-center gap-4 py-3 px-6 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
               <div className="text-center">
                  <p className="text-[8px] font-black opacity-40 uppercase">Mode</p>
                  <p className="text-xs font-bold">{selectedTime} MIN</p>
               </div>
               <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
               <div className="text-center">
                  <p className="text-[8px] font-black opacity-40 uppercase">Theme</p>
                  <p className="text-xs font-bold uppercase">{selectedTheme}</p>
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

      {user && (
        <div className="z-20 w-full max-w-[1100px] flex justify-between items-center mb-10 mt-4 px-6 py-4 rounded-[2rem] bg-white dark:bg-slate-900/30 backdrop-blur-md border border-slate-200 dark:border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-lg">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-black opacity-60 dark:opacity-40 uppercase tracking-widest text-slate-500 dark:text-slate-400">Commander</p>
              <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">{user.username}</h2>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}

      <div className="z-10 text-center mb-12">
        <h1 className="text-6xl font-black tracking-tighter mb-1 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-600 dark:from-white dark:to-slate-500">
          CHESS PLATFORM
        </h1>
        <p className="text-[9px] font-black tracking-[0.5em] uppercase opacity-60 dark:opacity-40 text-slate-500 dark:text-slate-400">War Room & Strategic Operations</p>
      </div>

      <div className="z-10 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-xl">
            <div className="space-y-8">
              <section>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-3 opacity-60 ml-1">
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
                <label className="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-60 ml-1">Board Aesthetic</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['classic', 'modern', 'emerald'] as ChessTheme[]).map(theme => (
                    <button key={theme} onClick={() => setSelectedTheme(theme)} className={`relative p-3 rounded-2xl transition-all border-2 flex flex-col items-center gap-3 ${selectedTheme === theme ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5' : 'border-transparent bg-slate-50 dark:bg-slate-800/40'}`}>
                      <div className="w-10 h-10 grid grid-cols-2 rounded-lg overflow-hidden shadow-sm">
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].light }}></div>
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].dark }}></div>
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].dark }}></div>
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].light }}></div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tighter">{theme}</span>
                    </button>
                  ))}
                </div>
              </section>
              <button 
                onClick={handleCreateRoom} 
                disabled={isCreating}
                className="w-full py-5 flex items-center justify-center gap-3 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs transition-all bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
                Initialize Match
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[3rem] p-1 overflow-hidden shadow-lg">
            {user && (
                <Dashboard 
                    userId={user.id} 
                    activeLobbyId={waitingRoomId} 
                />
            )}
        </div>
        </div>
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-xl min-h-[400px]">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={20} />
                  <h2 className="text-lg font-black uppercase tracking-widest">Active Operations</h2>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">{rooms.length} Channels Open</span>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.length > 0 ? rooms.map(room => (
                  <div key={room.roomId} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center group hover:border-blue-500 transition-all shadow-sm">
                    <div>
                      <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Host</p>
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
                )) : (
                  <div className="col-span-2 py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-20">
                        <Sword size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">No active combat signals detected...</p>
                  </div>
                )}
             </div>
          </div>
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[3rem] p-4 shadow-xl">
            {user && <MatchHistory userId={user.id} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
