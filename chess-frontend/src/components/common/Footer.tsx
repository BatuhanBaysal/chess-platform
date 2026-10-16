import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface FooterProps {
  isInGame?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isInGame }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [ping, setPing] = useState<number>(14);

  const isGamePage = Boolean(isInGame) || location.pathname.startsWith('/game');
  const isAuthPage = ['/login', '/register', '/sign-in', '/sign-up'].includes(location.pathname);
  const isOnline = Boolean(user) || Boolean(localStorage.getItem('token'));

  const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const swaggerUrl = `${backendBaseUrl.replace(/\/+$/, '')}/swagger-ui/index.html`;

  useEffect(() => {
    if (isGamePage) return;

    let isMounted = true;
    const checkPing = async () => {
      const start = performance.now();
      try {
        await fetch('/api/auth/health', { method: 'HEAD' });
        const end = performance.now();
        if (isMounted) setPing(Math.round(end - start));
      } catch (error) {
        if (isMounted) setPing(999);
      }
    };

    checkPing();
    const interval = setInterval(checkPing, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isGamePage]);

  if (isGamePage) {
    return null;
  }

  return (
    <footer className="w-full mt-auto bg-slate-50/80 dark:bg-[#020617] border-t border-slate-200/90 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Telemetry & Connectivity */}
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            CHESS PLATFORM V2.6.0
          </span>

          <span className="text-slate-300 dark:text-slate-700 select-none hidden sm:inline">•</span>

          {isAuthPage ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/90 dark:bg-amber-950/30 dark:border-amber-800/40">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                STANDBY
              </span>
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
              isOnline 
                ? 'bg-emerald-50 border-emerald-200/90 dark:bg-emerald-950/30 dark:border-emerald-800/40' 
                : 'bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isOnline 
                  ? 'text-emerald-800 dark:text-emerald-300' 
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                {isOnline ? 'ONLINE' : 'STANDBY'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 shadow-2xs">
            <span className={`w-2 h-2 rounded-full ${ping > 200 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              PING: <span className={ping > 200 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>{ping}ms</span>
            </span>
          </div>
        </div>

        {/* Creator Attribution */}
        <div className="flex items-center gap-1.5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            CREATED BY
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white">
            BATUHAN BAYSAL
          </span>
        </div>

        {/* External Links */}
        <div className="flex items-center gap-5 justify-center">
          <a 
            href={swaggerUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
            title="Swagger API Documentation"
          >
            SWAGGER
          </a>

          <a 
            href="https://github.com/BatuhanBaysal/chess-platform" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
          >
            SOURCE
          </a>

          <a 
            href="https://github.com/BatuhanBaysal" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
          >
            GITHUB
          </a>

          <a 
            href="https://www.linkedin.com/in/batuhan-baysal" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
          >
            LINKEDIN
          </a>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
export default Footer;
