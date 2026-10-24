import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
    Sun, 
    Moon, 
    LogOut, 
    Menu as MenuIcon, 
    X, 
    ShieldAlert, 
    Settings, 
    Info, 
    Mail, 
    FileText, 
    Activity, 
    Flag, 
    Wifi, 
    LayoutDashboard,
    Volume2,
    VolumeX
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useChessAudio } from '../../features/chess/hooks/useChessAudio';
import { getUsernameAvatarUrl } from '../../utils/avatarUtils';

interface HeaderProps {
    onBackToMenu?: () => void;
    isInGame?: boolean;
    activeGameId?: string;
}

export const Header: React.FC<HeaderProps> = ({ onBackToMenu, isInGame, activeGameId }) => {
    const { user, logout } = useAuth(); 
    const { colorMode, toggleTheme } = useTheme();
    const { isMuted, toggleMute, playDefeatSound } = useChessAudio();
    const location = useLocation();
    const navigate = useNavigate();
    const isDark = colorMode === 'dark';

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [confirmResign, setConfirmResign] = useState(false);
    const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());

    const isGamePage = Boolean(isInGame) || location.pathname.startsWith('/game');

    const isLocalEnv = Boolean(import.meta.env.DEV) || 
        (typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1'
        ));

    const rawRole = user?.role || localStorage.getItem('role') || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}')?.role : '');
    const roleString = typeof rawRole === 'string' ? rawRole : (rawRole as any)?.name || String(rawRole || '').toUpperCase();
    const normalizedRole = roleString.toUpperCase();

    const hasActiveSession = Boolean(user) || Boolean(localStorage.getItem('userId')) || Boolean(localStorage.getItem('token'));
    const currentUsername = user?.username || (user as any)?.name || (user as any)?.sub || localStorage.getItem('username') || (normalizedRole.includes('GUEST') ? 'Guest' : (hasActiveSession ? 'User' : ''));
    
    const isGuest = normalizedRole.includes('GUEST') || currentUsername.toLowerCase().startsWith('guest');
    const isAdmin = normalizedRole.includes('ADMIN') || normalizedRole === 'ROLE_ADMIN';

    const userInitial = (currentUsername.charAt(0) || 'U').toUpperCase();

    useEffect(() => {
        const handleAvatarUpdate = () => {
            setAvatarTimestamp(Date.now());
        };
        window.addEventListener('avatarUpdated', handleAvatarUpdate);
        return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    }, []);

    const avatarSrc = currentUsername && !isGuest 
        ? getUsernameAvatarUrl(currentUsername, avatarTimestamp) 
        : null;

    const isSignInActive = location.pathname === '/sign-in' || location.pathname === '/login';
    const isSignUpActive = location.pathname === '/sign-up' || location.pathname === '/register';

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!confirmResign) return;
        const timer = setTimeout(() => {
            setConfirmResign(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, [confirmResign]);

    const handleLogoClick = () => {
        if (isGamePage) return;
        if (onBackToMenu) onBackToMenu();
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLeaveToMenu = () => {
        if (onBackToMenu) onBackToMenu();
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleResignGame = () => {
        if (!confirmResign) {
            setConfirmResign(true);
            return;
        }

        setConfirmResign(false);
        localStorage.setItem('just_resigned', 'true');

        playDefeatSound();

        const resolvedGameId = activeGameId || localStorage.getItem('activeGameId') || localStorage.getItem('currentGameId');
        if (resolvedGameId) {
            const dismissedGames: string[] = JSON.parse(localStorage.getItem('dismissed_games') || '[]');
            if (!dismissedGames.includes(resolvedGameId)) {
                dismissedGames.push(resolvedGameId);
                localStorage.setItem('dismissed_games', JSON.stringify(dismissedGames));
            }
        }

        localStorage.removeItem('activeGameId');
        localStorage.removeItem('currentGameId');

        if (onBackToMenu) {
            onBackToMenu();
        }

        setTimeout(() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 350);
    };

    const handleMenuClick = (path: string) => {
        if (location.pathname === path || (path === '/menu' && location.pathname === '/')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const navLinks = [
        {
            id: 'menu',
            label: 'MENU',
            path: '/menu',
            icon: <LayoutDashboard size={14} />,
            show: !isGamePage && !isSignInActive && !isSignUpActive && hasActiveSession
        },
        {
            id: 'admin',
            label: 'ADMIN',
            path: '/admin',
            icon: <ShieldAlert size={14} />,
            show: !isGamePage && hasActiveSession && isAdmin
        },
        {
            id: 'profile',
            label: 'PROFILE',
            path: '/profile',
            icon: <Settings size={14} />,
            show: !isGamePage && hasActiveSession && !isGuest
        },
        {
            id: 'about',
            label: 'ABOUT',
            path: '/about',
            icon: <Info size={14} />,
            show: !isGamePage
        },
        {
            id: 'contact',
            label: 'CONTACT',
            path: '/contact',
            icon: <Mail size={14} />,
            show: !isGamePage
        },
        {
            id: 'changelog',
            label: 'CHANGELOG',
            path: '/changelog',
            icon: <FileText size={14} />,
            show: !isGamePage
        },
        {
            id: 'system-health',
            label: 'SYSTEM HEALTH',
            path: '/system-health',
            icon: <Activity size={14} />,
            show: !isGamePage && hasActiveSession && isLocalEnv
        }
    ].filter(item => item.show);

    return (
        <header className="fixed top-0 inset-x-0 w-full h-16 z-50 bg-white/95 dark:bg-[#020617]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="w-full h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
                {/* Brand Logo */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button 
                        onClick={handleLogoClick}
                        className={`flex items-center gap-2 sm:gap-2.5 text-left group transition-transform ${isGamePage ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
                        title={isGamePage ? 'Match in progress' : 'Chess Platform Home'}
                    >
                        <img 
                            src="/assets/images/batu_chess_logo.svg" 
                            alt="BatuChess Logo" 
                            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <span className="text-sm sm:text-lg font-black tracking-wider uppercase text-slate-950 dark:text-white select-none whitespace-nowrap">
                            CHESS <span className={`text-indigo-600 dark:text-indigo-400 ${isGamePage ? 'hidden sm:inline' : 'inline'}`}>PLATFORM</span>
                        </span>
                    </button>
                </div>

                {/* Central Telemetry */}
                <div className="hidden md:flex items-center justify-center gap-1 lg:gap-1.5 shrink-0">
                    {isGamePage ? (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                Live Match Session
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 text-xs">|</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <Wifi size={13} />
                                <span>Realtime</span>
                            </div>
                        </div>
                    ) : (
                        navLinks.map((link) => {
                            const isMenuLink = link.id === 'menu';
                            const isActive = isMenuLink 
                                ? (location.pathname === '/menu' || location.pathname === '/')
                                : location.pathname === link.path;

                            return (
                                <Link
                                    key={link.id}
                                    to={link.path}
                                    onClick={() => handleMenuClick(link.path)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase whitespace-nowrap shrink-0 transition-all duration-200 ${
                                        isActive
                                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                    }`}
                                >
                                    {link.icon}
                                    <span className="whitespace-nowrap">{link.label}</span>
                                </Link>
                            );
                        })
                    )}
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                    {isGamePage && (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                                onClick={handleLeaveToMenu}
                                className="min-h-9 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                                title="Return to Menu (Match stays active)"
                            >
                                <LayoutDashboard size={13} className="shrink-0" />
                                <span>Menu</span>
                            </button>

                            {/* Sound Toggle */}
                            <button
                                onClick={toggleMute} 
                                className={`min-h-9 p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                                    isMuted 
                                        ? 'text-slate-400 bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700' 
                                        : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60'
                                }`}
                                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                                aria-label="Toggle sound"
                            >
                                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                            </button>

                            <button
                                onClick={handleResignGame}
                                className={`min-h-9 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                                    confirmResign 
                                        ? 'bg-rose-600 text-white animate-pulse border border-rose-600 shadow-md shadow-rose-600/30' 
                                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/40'
                                }`}
                                title="Forfeit match permanently"
                            >
                                <Flag size={13} className="shrink-0" />
                                <span>
                                    {confirmResign ? (
                                        <>
                                            <span className="sm:hidden">Confirm?</span>
                                            <span className="hidden sm:inline">Confirm Resign?</span>
                                        </>
                                    ) : (
                                        'Resign'
                                    )}
                                </span>
                            </button>
                        </div>
                    )}

                    {!hasActiveSession && !isGamePage && (
                        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                            <Link
                                to="/sign-in"
                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                    isSignInActive
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/sign-up"
                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                    isSignUpActive
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}

                    {/* Active User Badge */}
                    {hasActiveSession && !isGamePage && (
                        isGuest ? (
                            <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs shrink-0 select-none">
                                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                                    {userInitial}
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 max-w-44 truncate">
                                    {currentUsername}
                                </span>
                            </div>
                        ) : (
                            <Link
                                to="/profile"
                                aria-label="User Profile"
                                className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-indigo-500/40 shadow-xs shrink-0 transition-all cursor-pointer group active:scale-95"
                                title="Open Profile Settings"
                            >
                                <div className="relative w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                                    {avatarSrc && (
                                        <img 
                                            key={avatarSrc}
                                            src={avatarSrc} 
                                            alt={currentUsername} 
                                            className="w-full h-full object-cover z-10" 
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <span className="absolute z-0">{userInitial}</span>
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 max-w-44 truncate transition-colors">
                                    {currentUsername}
                                </span>
                            </Link>
                        )
                    )}

                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun className="text-amber-400" size={17} /> : <Moon className="text-slate-700" size={17} />}
                    </button>

                    {/* Sign Out Button */}
                    {hasActiveSession && !isGamePage && (
                        <button 
                            onClick={logout} 
                            className="hidden sm:flex p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                            title="Sign Out"
                            aria-label="Sign out"
                        >
                            <LogOut size={18} />
                        </button>
                    )}

                    {/* Mobile Drawer Toggle */}
                    {!isGamePage && (
                        <button 
                            onClick={() => setMobileMenuOpen(prev => !prev)}
                            className="flex md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && !isGamePage && (
                <div className="md:hidden w-full bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
                    {hasActiveSession && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-3">
                            {isGuest ? (
                                <div className="flex items-center gap-2.5 min-w-0 select-none">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0">
                                        {userInitial}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-black uppercase text-slate-950 dark:text-white truncate">
                                            {currentUsername}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            {normalizedRole.replace('ROLE_', '') || 'MEMBER'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to="/profile"
                                    aria-label="User Profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2.5 min-w-0 group cursor-pointer"
                                    title="Open Profile Settings"
                                >
                                    <div className="relative w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-black overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                        {avatarSrc && (
                                            <img 
                                                key={avatarSrc}
                                                src={avatarSrc} 
                                                alt={currentUsername} 
                                                className="w-full h-full object-cover z-10" 
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <span className="absolute z-0">{userInitial}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-black uppercase text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate transition-colors">
                                            {currentUsername}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            {normalizedRole.replace('ROLE_', '') || 'MEMBER'}
                                        </div>
                                    </div>
                                </Link>
                            )}
                            <button 
                                onClick={logout} 
                                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        {navLinks.map((link) => {
                            const isMenuLink = link.id === 'menu';
                            const isActive = isMenuLink 
                                ? (location.pathname === '/menu' || location.pathname === '/')
                                : location.pathname === link.path;

                            return (
                                <Link
                                    key={link.id}
                                    to={link.path}
                                    onClick={() => {
                                        handleMenuClick(link.path);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                                        isActive
                                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 font-black'
                                            : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                                    }`}
                                >
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {!hasActiveSession && (
                        <div className="flex items-center gap-2 pt-3 mt-2 border-t border-slate-200 dark:border-slate-800">
                            <Link
                                to="/sign-in"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex-1 py-2.5 text-center rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    isSignInActive
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/sign-up"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex-1 py-2.5 text-center rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    isSignUpActive
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Mobile Backdrop */}
            {mobileMenuOpen && !isGamePage && (
                <div 
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 top-16 bg-black/20 dark:bg-black/50 backdrop-blur-xs z-[-1] md:hidden"
                    aria-hidden="true"
                />
            )}
        </header>
    );
};

export default Header;
