import React, { useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface PromotionModalProps {
  orientation: 'WHITE' | 'BLACK';
  pieceImages: { [key: string]: string };
  onSelectPromotion: (type: string) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ orientation, pieceImages, onSelectPromotion }) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'Q') onSelectPromotion('QUEEN');
      if (key === 'R') onSelectPromotion('ROOK');
      if (key === 'B') onSelectPromotion('BISHOP');
      if (key === 'N') onSelectPromotion('KNIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectPromotion]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackText: string) => {
    const target = e.currentTarget as HTMLImageElement;
    target.style.display = 'none';
    if (target.parentElement) {
      target.parentElement.innerHTML = `<span class="text-3xl font-black text-slate-400">${fallbackText}</span>`;
    }
  };

  return (
    <div className="fixed inset-0 z-600 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className={`bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border ${orientation === 'WHITE' ? 'border-blue-500/30' : 'border-rose-500/30'} shadow-2xl flex flex-col items-center gap-8 max-w-2xl w-full mx-4 relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-full h-2 bg-linear-to-r ${orientation === 'WHITE' ? 'from-blue-600 to-cyan-400' : 'from-rose-600 to-orange-400'}`} />
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${orientation === 'WHITE' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'} mb-4`}>
            <ChevronUp size={16} className="animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest">Promotion</span>
          </div>
          <h2 className={`text-3xl font-black uppercase tracking-tighter italic ${orientation === 'WHITE' ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {orientation === 'WHITE' ? 'White Pawn Promotion' : 'Black Pawn Promotion'}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'].map((type) => {
            const char = type === 'KNIGHT' ? 'N' : type[0];
            const iconKey = orientation === 'WHITE' ? char : char.toLowerCase();
            return (
              <button 
                key={type} 
                onClick={() => onSelectPromotion(type)} 
                title={`${type} (Kısayol: ${char})`}
                className={`group flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-3xl transition-all hover:scale-105 active:scale-95 ${orientation === 'WHITE' ? 'hover:border-blue-500/50 hover:bg-blue-500/5' : 'hover:border-rose-500/50 hover:bg-rose-500/5'}`}>
                <div className="w-20 h-20 mb-4 transition-transform group-hover:rotate-6 flex items-center justify-center">
                  <img 
                    src={pieceImages[iconKey]} 
                    className="w-full h-full drop-shadow-xl" 
                    alt={type} 
                    onError={(e) => handleImageError(e, iconKey)}
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{type === 'ROOK' ? 'Rook' : type}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
