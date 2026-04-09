import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Dashboard from './Dashboard';
import MatchHistory from './MatchHistory';
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

  const fetchRooms = async () => {
    try {
      const res = await api.get('/api/lobby/rooms');
      setRooms(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 3000); 
    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = async () => {
    try {
      let currentUser = user;
      if (!currentUser) currentUser = await loginAsGuest();
      if (currentUser && currentUser.id) {
        const res = await api.post('/api/lobby/create', null, {
          params: { userId: currentUser.id, username: currentUser.username, time: selectedTime }
        });
        const roomId = typeof res.data === 'string' ? res.data : (res.data.roomId || res.data.id);
        if (roomId) onStart(selectedTheme, selectedTime, roomId);
      }
    } catch (e) {
      console.error("Create Match Error:", e);
      alert("Could not create match.");
    }
  };

  const handleJoinRoom = async (room: GameRoom) => {
    try {
      let currentUser = user;
      if (!currentUser) currentUser = await loginAsGuest();
      if (currentUser && currentUser.id) {
        await api.post('/api/lobby/join', null, {
          params: { roomId: room.roomId, userId: currentUser.id, username: currentUser.username }
        });
        onStart(selectedTheme, room.timeControl as TimeControl, room.roomId);
      }
    } catch (e) {
      console.error("Join Room Error:", e);
      alert("Could not join room.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 relative bg-slate-50 dark:bg-slate-950 overflow-x-hidden text-slate-900 dark:text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-blue-500/10 dark:bg-blue-600/20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-purple-500/10 dark:bg-purple-600/20" />
      </div>

      {user && (
        <div className="z-20 w-full max-w-[1100px] flex justify-between items-center mb-10 mt-4 px-6 py-4 rounded-[2rem] bg-white dark:bg-slate-900/30 backdrop-blur-md border border-slate-200 dark:border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-lg">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-black opacity-60 dark:opacity-40 uppercase tracking-widest text-slate-500 dark:text-slate-400">Logged in as</p>
              <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                {user.username} 
                {user.isGuest && <span className="ml-2 text-[8px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">GUEST</span>}
              </h2>
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
        <p className="text-[9px] font-black tracking-[0.5em] uppercase opacity-60 dark:opacity-40 text-slate-500 dark:text-slate-400">Lobby & Matchmaking System</p>
      </div>

      <div className="z-10 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="space-y-8">
              <section>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-60 dark:opacity-40 ml-1 text-slate-600 dark:text-slate-400">Time Control</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 10, 30].map(t => (
                    <button key={t} onClick={() => setSelectedTime(t as TimeControl)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${selectedTime === t ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:border-blue-400 text-slate-600 dark:text-slate-300'}`}>
                      {t} MIN
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-60 dark:opacity-40 ml-1 text-slate-600 dark:text-slate-400">Board Aesthetic</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['classic', 'modern', 'emerald'] as ChessTheme[]).map(theme => (
                    <button key={theme} onClick={() => setSelectedTheme(theme)} className={`relative p-3 rounded-2xl transition-all border-2 flex flex-col items-center gap-3 ${selectedTheme === theme ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5' : 'border-transparent bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}>
                      <div className="w-10 h-10 grid grid-cols-2 rounded-lg overflow-hidden shadow-sm">
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].light }}></div>
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].dark }}></div>
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].dark }}></div>
                        <div style={{ backgroundColor: THEME_PREVIEWS[theme].light }}></div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-slate-700 dark:text-slate-300">{theme}</span>
                    </button>
                  ))}
                </div>
              </section>

              <button onClick={handleCreateRoom} className="w-full py-5 flex items-center justify-center gap-3 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs transition-all bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-black dark:hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                <Plus size={16} /> Create Match
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[3rem] p-1 overflow-hidden shadow-lg shadow-slate-200/40 dark:shadow-none">
             {user && <Dashboard userId={user.id} />}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[300px]">
             <div className="flex items-center gap-3 mb-6">
                <Users className="text-blue-600 dark:text-blue-500" size={20} />
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white/80">Available Rooms</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.length > 0 ? rooms.map(room => (
                  <div key={room.roomId} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center group hover:border-blue-500 transition-all shadow-sm">
                    <div>
                      <p className="text-[10px] font-black opacity-60 dark:opacity-40 uppercase tracking-widest text-slate-500 dark:text-slate-400">Host</p>
                      <p className="font-bold text-slate-900 dark:text-white">{room.hostName}</p>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-1">{room.timeControl} MIN • {room.roomId}</p>
                    </div>
                    <button onClick={() => handleJoinRoom(room)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md transition-all">
                      Join
                    </button>
                  </div>
                )) : (
                  <div className="col-span-2 py-10 text-center text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">
                    No active rooms. Create one to start!
                  </div>
                )}
             </div>
          </div>
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[3rem] p-2 shadow-xl shadow-slate-200/50 dark:shadow-none">
            {user && <MatchHistory userId={user.id} />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
