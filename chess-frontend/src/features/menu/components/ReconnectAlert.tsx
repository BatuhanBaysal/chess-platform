import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { GameResponse } from '../../../api/gameService';

interface ReconnectAlertProps {
  reconnectGame: GameResponse;
  onReconnect: () => void;
  onDismiss: () => void;
}

export const ReconnectAlert: React.FC<ReconnectAlertProps> = ({
  reconnectGame,
  onReconnect,
  onDismiss
}) => {
  return (
    <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-right-10 duration-500 w-[90%] max-w-xs">
      <div className="bg-blue-600 p-6 rounded-3xl shadow-2xl border border-white/10 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="text-white animate-spin-slow" size={20} />
          <span className="text-xs font-black uppercase tracking-widest text-white">Active Signal Found</span>
        </div>
        <p className="text-[10px] font-bold text-blue-100 uppercase opacity-80 leading-relaxed">
          You have a match in progress. Re-establish neural link to Sector {reconnectGame.gameId.substring(0, 4)}?
        </p>
        <div className="flex gap-2">
          <button 
            onClick={onReconnect}
            className="flex-1 py-3 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all"
          >
            Reconnect
          </button>
          <button 
            onClick={onDismiss}
            className="px-4 py-3 bg-blue-700 text-blue-200 rounded-xl text-[10px] font-black uppercase hover:bg-blue-800 transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
