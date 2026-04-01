import React, { useState } from 'react';
import { Check } from 'lucide-react';

type ChessTheme = 'classic' | 'modern' | 'emerald';
type TimeControl = 3 | 10 | 30;

interface LandingPageProps {
  onStart: (theme: ChessTheme, time: TimeControl) => void;
}

const THEME_PREVIEWS = {
  classic: { dark: '#b58863', light: '#f0d9b5' },
  modern: { dark: '#4b7399', light: '#eae9d2' },
  emerald: { dark: '#6a8d5c', light: '#eceed1' }
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [selectedTheme, setSelectedTheme] = useState<ChessTheme>('classic');
  const [selectedTime, setSelectedTime] = useState<TimeControl>(10);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-blue-500/10 dark:bg-blue-600/20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-purple-500/10 dark:bg-purple-600/20" />
      </div>

      <div className="z-10 text-center mb-10">
        <h1 className="text-6xl font-black tracking-tighter mb-1 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-500 dark:from-white dark:to-slate-500">
          CHESS PLATFORM
        </h1>
        <p className="text-[9px] font-black tracking-[0.5em] uppercase opacity-40">Real-Time Multiplayer Experience</p>
      </div>

      <div className="z-10 w-full max-w-[420px] p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl">
        <div className="space-y-8">
          <section>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-40 ml-1">Time Control</label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 10, 30].map(t => (
                <button 
                  key={t}
                  onClick={() => setSelectedTime(t as TimeControl)}
                  className={`py-3 rounded-xl text-[10px] font-black transition-all border ${selectedTime === t ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {t} MIN
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-40 ml-1">Board Aesthetic</label>
            <div className="grid grid-cols-3 gap-3">
              {(['classic', 'modern', 'emerald'] as ChessTheme[]).map(theme => (
                <button 
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`relative p-3 rounded-2xl transition-all border-2 flex flex-col items-center gap-3 ${selectedTheme === theme ? 'border-blue-500 bg-blue-500/5' : 'border-transparent bg-slate-100 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <div className="w-10 h-10 grid grid-cols-2 rounded-lg overflow-hidden shadow-md">
                    <div style={{ backgroundColor: THEME_PREVIEWS[theme].light }}></div>
                    <div style={{ backgroundColor: THEME_PREVIEWS[theme].dark }}></div>
                    <div style={{ backgroundColor: THEME_PREVIEWS[theme].dark }}></div>
                    <div style={{ backgroundColor: THEME_PREVIEWS[theme].light }}></div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-80">{theme}</span>
                  {selectedTheme === theme && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full shadow-sm">
                      <Check size={10} strokeWidth={4}/>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <button 
            onClick={() => onStart(selectedTheme, selectedTime)}
            className="w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs transition-all bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:scale-[1.02] active:scale-95 shadow-xl"
          >
            Initiate Match
          </button>
        </div>
      </div>

      <footer className="z-10 mt-12 w-full max-w-[380px]">
        <div className="p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md flex flex-col items-center text-center shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">Architect</span>
          <h3 className="text-2xl font-black tracking-tight mb-1">Batuhan Baysal</h3>
          <p className="text-[11px] font-bold opacity-40 italic mb-5 uppercase tracking-[0.2em] font-mono">Software Developer</p>
          <div className="h-[1px] w-12 bg-slate-300 dark:bg-slate-700 mb-5" />
          <div className="text-[10px] font-black tracking-[0.3em] opacity-60 uppercase bg-slate-200/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full">
            Java • Spring • React
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
