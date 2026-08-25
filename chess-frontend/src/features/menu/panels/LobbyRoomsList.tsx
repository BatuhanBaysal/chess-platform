import React from 'react';
import { Users, Shield, Sword } from 'lucide-react';
import type { GameRoom } from '../hooks/useLobby';

interface LobbyRoomsListProps {
  rooms: GameRoom[];
  onJoinRoom: (room: GameRoom) => void;
}

export const LobbyRoomsList: React.FC<LobbyRoomsListProps> = ({ rooms, onJoinRoom }) => {
  return (
    <div className="p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-blue-600" size={20} />
          <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">Active Channels</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{rooms.length} Active</span>
        </div>
      </div>
      <div className="max-h-95 overflow-y-auto space-y-3 pr-1">
        {rooms.length > 0 ? (
          rooms.map(room => (
            <div key={room.roomId} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 flex justify-between items-center group hover:border-blue-500 transition-all shadow-sm">
              <div>
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-slate-900 dark:text-white">{room.hostName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Shield size={10} className="text-blue-500" />
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                    {room.timeLimit} MIN {room.theme ? `• ${room.theme.toUpperCase()}` : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onJoinRoom(room)} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-1.5 group-hover:shadow-blue-600/40"
              >
                <span>Engage</span>
                <Sword size={11} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="h-48 flex flex-col items-center justify-center opacity-40 text-slate-900 dark:text-white">
            <Sword size={24} className="mb-2" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No signals detected...</p>
          </div>
        )}
      </div>
    </div>
  );
};
