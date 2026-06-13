import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  colorMode: string;
  setColorMode: React.Dispatch<React.SetStateAction<string>>;
  view?: 'MENU' | 'GAME';
  onBackToMenu?: () => void;
}

const Header: React.FC<HeaderProps> = ({ colorMode, setColorMode, view, onBackToMenu }) => {
  const { user, logout } = useAuth(); 
  const location = useLocation();
  const isDark = colorMode === 'dark';
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="w-full px-8 py-4 flex justify-between items-center bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md fixed top-0 left-0 z-50 transition-colors duration-500 border-b border-slate-200 dark:border-slate-800/50">
      <div className="flex items-center gap-3">
        {view === 'GAME' && (
          <button 
            onClick={onBackToMenu}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/50 rounded-full text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all"
          >
            <LayoutDashboard size={14} />
            <span>Menu</span>
          </button>
        )}

        {!isAuthPage && user && (
          <div className="flex items-center gap-2 px-3 py-1.5 border border-blue-500/30 bg-blue-500/10 rounded-full text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <User size={14} />
            <span>{user.username}</span>
          </div>
        )}
      </div>

      <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-linear-to-b from-slate-950 to-slate-600 dark:from-white dark:to-slate-500">
        CHESS PLATFORM
      </h1>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setColorMode(isDark ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-slate-600" size={20} />}
        </button>

        {user && (
          <button 
            onClick={logout}
            className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-500 transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
