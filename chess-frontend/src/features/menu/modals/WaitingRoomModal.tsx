import React from 'react';
import { Sword } from 'lucide-react';

interface WaitingRoomModalProps {
  waitingRoomId: string | null;
  selectedTime: number;
  selectedTheme: string;
  onCancel: () => void;
}

export const WaitingRoomModal: React.FC<WaitingRoomModalProps> = ({
  waitingRoomId,
  selectedTime,
  selectedTheme,
  onCancel
}) => {
  if (!waitingRoomId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-blue-500/30 shadow-2xl text-center max-w-sm w-[90%]">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          <Sword className="absolute inset-0 m-auto text-blue-500" size={30} />
        </div>
        <h2 className="text-xl font-black tracking-tighter mb-2 uppercase text-slate-900 dark:text-white">Searching Opponent</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-6">Room ID: {waitingRoomId}</p>
        <div className="flex items-center justify-center gap-4 py-3 px-6 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
          <div className="text-center">
              <p className="text-[8px] font-black opacity-40 uppercase text-slate-900 dark:text-white">Mode</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedTime} MIN</p>
           </div>
            <div className="w-px h-8 bg-slate-300 dark:bg-slate-700"></div>
            <div className="text-center">
              <p className="text-[8px] font-black opacity-40 uppercase text-slate-900 dark:text-white">Theme</p>
              <p className="text-xs font-bold uppercase text-slate-900 dark:text-white">{selectedTheme}</p>
           </div>
        </div>
        <button 
          onClick={onCancel}
          className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:opacity-70 transition-opacity"
        >
          Cancel Deployment
        </button>
      </div>
    </div>
  );
};