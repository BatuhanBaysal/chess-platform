import React, { useEffect } from 'react';
import { ChevronUp, ShieldCheck } from 'lucide-react';

interface PromotionModalProps {
  orientation: 'WHITE' | 'BLACK';
  pieceImages: { [key: string]: string };
  onSelectPromotion: (type: string) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ orientation, pieceImages, onSelectPromotion }) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'Q') onSelectPromotion('QUEEN');
      if (key === 'R') onSelectPromotion('ROOK');
      if (key === 'B') onSelectPromotion('BISHOP');
      if (key === 'N') onSelectPromotion('KNIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSelectPromotion]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackText: string) => {
    const target = e.currentTarget as HTMLImageElement;
    target.style.display = 'none';
    if (target.parentElement) {
      target.parentElement.innerHTML = `<span class="text-2xl font-black text-slate-400">${fallbackText}</span>`;
    }
  };

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-[#070b19] border ${orientation === 'WHITE' ? 'border-blue-500/40' : 'border-rose-500/40'} p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-lg w-full relative overflow-hidden`}>
        {/* Accent Bar */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${orientation === 'WHITE' ? 'bg-indigo-600' : 'bg-rose-600'}`} />

        {/* Modal Header */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${orientation === 'WHITE' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'} mb-2 text-[10px] font-black uppercase tracking-wider`}>
            <ChevronUp size={14} className="animate-bounce" />
            <span>Promotion</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
            {orientation === 'WHITE' ? 'White Pawn Promotion' : 'Black Pawn Promotion'}
          </h2>
        </div>

        {/* Piece Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'].map((type) => {
            const char = type === 'KNIGHT' ? 'N' : type[0];
            const iconKey = orientation === 'WHITE' ? char : char.toLowerCase();
            return (
              <button 
                key={type} 
                onClick={() => onSelectPromotion(type)} 
                title={`${type} (Hotkey: ${char})`}
                className={`flex flex-col items-center p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  orientation === 'WHITE' ? 'hover:border-blue-500/60' : 'hover:border-rose-500/60'
                }`}
              >
                <div className="w-14 h-14 mb-2 flex items-center justify-center">
                  <img 
                    src={pieceImages[iconKey]} 
                    className="w-full h-full drop-shadow-md" 
                    alt={type} 
                    onError={(e) => handleImageError(e, iconKey)}
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">{type}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Signature */}
        <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mt-2 w-full">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>CHESS PLATFORM</span>
          </div>
          <span>BATUHAN BAYSAL • 2026</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
