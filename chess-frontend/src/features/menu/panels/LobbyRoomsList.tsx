import React from 'react';
import { Users, Shield, Sword } from 'lucide-react';
import type { GameRoom } from '../hooks/useLobby';

interface LobbyRoomsListProps {
  rooms: GameRoom[];
  onJoinRoom: (room: GameRoom) => void;
}

export const LobbyRoomsList: React.FC<LobbyRoomsListProps> = ({ rooms, onJoinRoom }) => {
  return (
    <div className="p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070b19] shadow-sm flex flex-col justify-between h-auto lg:h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Users className="text-indigo-600 dark:text-indigo-400" size={18} />
            <h2 className="text-base font-black uppercase tracking-wider text-slate-950 dark:text-white">
              ACTIVE CHANNELS
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-900 dark:text-slate-400 uppercase tracking-wider">
              {rooms.length} ACTIVE
            </span>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {rooms.length > 0 ? (
            rooms.map(room => (
              <div 
                key={room.roomId} 
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center hover:border-indigo-500/50 transition-all shadow-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-black text-slate-950 dark:text-white truncate">
                    {room.hostName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shield size={10} className="text-indigo-600 dark:text-indigo-500 shrink-0" />
                    <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-extrabold uppercase truncate">
                      {room.timeLimit} MIN {room.theme ? `• ${room.theme}` : ''}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onJoinRoom(room)} 
                  className="shrink-0 min-h-11 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Engage</span>
                  <Sword size={12} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 gap-2.5">
              <Sword size={26} className="opacity-50 text-slate-800 dark:text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">
                No signals detected...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyRoomsList;
