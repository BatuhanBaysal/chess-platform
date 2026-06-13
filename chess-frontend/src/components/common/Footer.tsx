import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Footer: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isOnline = !!user;

  return (
    <footer className="w-full py-6 px-10 bg-slate-100 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-500">
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-6">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 opacity-60">
            CHESS PLATFORM V1.0.0
          </p>
          
          {isAuthPage ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">
                SYSTEM: STANDBY
              </span>
            </div>
          ) : (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-500/10 border-slate-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                {isOnline ? 'LIVE CHANNEL: ONLINE' : 'SYSTEM: STANDBY'}
              </span>
            </div>
          )}
        </div>

        <div className="hidden md:block h-6 w-px bg-slate-300 dark:bg-slate-800"></div>
        <div className="flex flex-col items-center md:items-start">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
            BATUHAN BAYSAL
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
            COMPUTER ENGINEER | SOFTWARE DEVELOPER
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <a href="https://github.com/BatuhanBaysal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-1 1-1 2.35 0 3.5 0 3.5 3 5.5 6 5.5-.3.3-.6 1.3-.6 2.5V22"/></svg>
          <span className="text-[11px] font-black uppercase tracking-widest">GITHUB</span>
        </a>

        <a href="https://github.com/BatuhanBaysal/chess-platform" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <span className="text-[11px] font-black uppercase tracking-widest">SOURCE</span>
        </a>

        <a href="https://www.linkedin.com/in/batuhan-baysal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          <span className="text-[11px] font-black uppercase tracking-widest">LINKEDIN</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
