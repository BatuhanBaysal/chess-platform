import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, LayoutDashboard, Settings, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
    onBackToMenu?: () => void;
    isInGame?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onBackToMenu, isInGame }) => {
    const { user, logout } = useAuth(); 
    const { colorMode, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const isDark = colorMode === 'dark';
    
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const isGamePage = isInGame || location.pathname.startsWith('/game');
    const isProfilePage = location.pathname === '/profile';
    const isAdminPage = location.pathname === '/admin';
    const isHistoryPage = location.pathname === '/history';
    const isLeaderboardPage = location.pathname === '/leaderboard' || location.pathname.startsWith('/leaderboard');
    
    const showMenuButton = isGamePage || isProfilePage || isAdminPage || isHistoryPage || isLeaderboardPage;
    
    const isGuest = user?.role === 'ROLE_GUEST';
    const isAdmin = user?.role === 'ROLE_ADMIN';

    const renderLeftSide = () => {
        if (isAuthPage) return null;

        return (
            <div className="flex items-center gap-2.5">
                {showMenuButton && (
                    <button 
                        onClick={() => {
                            if (onBackToMenu) onBackToMenu();
                            navigate('/');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                    >
                        <LayoutDashboard size={15} />
                        <span>Menu</span>
                    </button>
                )}

                {user && (
                    <div className="flex items-center gap-2 px-3.5 py-2 border border-blue-500/30 bg-blue-500/10 rounded-full text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        <User size={15} />
                        <span>{user?.username}</span>
                    </div>
                )}
            </div>
        );
    };

    const subNavItems = [
        {
            id: 'profile',
            show: !isAuthPage && !!user && !isGamePage && !isGuest,
            element: (
                <button 
                    key="profile"
                    onClick={() => navigate('/profile')} 
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer whitespace-nowrap bg-transparent border-none p-0"
                >
                    <Settings size={15} />
                    <span>MY PROFILE</span>
                </button>
            )
        },
        {
            id: 'admin',
            show: !isAuthPage && !!user && !isGamePage && isAdmin,
            element: (
                <button 
                    key="admin"
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer whitespace-nowrap bg-transparent border-none p-0"
                >
                    <ShieldAlert size={15} />
                    <span>ADMIN DASHBOARD</span>
                </button>
            )
        }
    ];

    const activeSubNavItems = subNavItems.filter(item => item.show);

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-500">
            <div className="w-full px-8 py-3.5 flex justify-between items-center">
                <div className="flex items-center">
                    {renderLeftSide()}
                </div>

                <h1 
                    onClick={() => {
                        if (onBackToMenu) onBackToMenu();
                        navigate('/');
                    }}
                    className="text-2xl md:text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-linear-to-b from-slate-950 to-slate-600 dark:from-white dark:to-slate-500 cursor-pointer select-none text-center"
                >
                    CHESS PLATFORM
                </h1>

                <div className="flex items-center justify-end gap-3">
                    <button 
                        onClick={toggleTheme} 
                        className="p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
                        title="Toggle Theme"
                    >
                        {isDark ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-slate-600" size={20} />}
                    </button>

                    {!isAuthPage && !isGamePage && user && (
                        <button 
                            onClick={logout}
                            className="p-2.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>

            {!isGamePage && activeSubNavItems.length > 0 && (
                <div className="w-full bg-white/80 dark:bg-[#020617]/80 border-t border-slate-200 dark:border-slate-800/50 px-8 py-3.5 flex justify-center items-center gap-6">
                    {activeSubNavItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                            {index > 0 && <span className="text-slate-300 dark:text-slate-700 font-light select-none">|</span>}
                            {item.element}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;
