import React, { useState } from 'react';
import { Globe2, Cpu, Lightbulb, ArrowRight, Sparkles, Clock, ShieldCheck, Loader2 } from 'lucide-react';

interface AuthShowcaseProps {
  onGuestLogin: () => void | Promise<void>;
  isGuestLoading?: boolean;
}

export const AuthShowcase: React.FC<AuthShowcaseProps> = ({ onGuestLogin, isGuestLoading }) => {
  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = isGuestLoading ?? localLoading;

  const handleGuestClick = async () => {
    if (isLoading) return;
    setLocalLoading(true);
    try {
      await onGuestLogin();
    } catch {
      setLocalLoading(false);
    }
  };

  const features = [
    {
      icon: <Globe2 className="text-blue-400" size={22} />,
      title: 'Online Multiplayer',
      desc: 'Fast real-time matches against online players.'
    },
    {
      icon: <Cpu className="text-indigo-400" size={22} />,
      title: 'Stockfish AI Engine',
      desc: 'Play against Stockfish across 3 difficulty levels.'
    },
    {
      icon: <Lightbulb className="text-amber-400" size={22} />,
      title: 'Smart Hints',
      desc: 'Get move suggestions and live board analysis in any game.'
    }
  ];

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Brand & Features */}
      <div>
        <div className="mb-5 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-white drop-shadow-md">
            CHESS <span className="text-indigo-400">PLATFORM</span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {features.map((item, idx) => (
            <div 
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/75 backdrop-blur-md border border-slate-700/60 flex items-start gap-3.5 transition-all hover:border-indigo-400/60 shadow-lg"
            >
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5 font-medium">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guest Mode Card */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-indigo-500/40 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-2 gap-3 mb-3.5">
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-0.5">
              <ShieldCheck size={14} />
              <span className="text-xs font-black uppercase tracking-wider">Registered</span>
            </div>
            <div className="text-sm font-black text-white">1200 ELO</div>
            <div className="text-xs text-slate-400 mt-0.5">Permanent Profile</div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-400 mb-0.5">
              <Clock size={14} />
              <span className="text-xs font-black uppercase tracking-wider">Guest Mode</span>
            </div>
            <div className="text-sm font-black text-white">400 ELO</div>
            <div className="text-xs text-slate-400 mt-0.5">7-Day Access</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGuestClick}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/75 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/40 active:scale-98"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="text-indigo-200 animate-spin" />
              <span>Starting Guest Session...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} className="text-indigo-200" />
              <span>Play as Guest Now</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AuthShowcase;
