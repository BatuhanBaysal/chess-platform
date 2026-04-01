import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, UserPlus, Mail, Sun, Moon } from 'lucide-react';

interface AuthCardProps {
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string, email: string) => Promise<void> | void;
  onGuestLogin: () => void;
  colorMode: string;
  setColorMode: React.Dispatch<React.SetStateAction<string>>;
}

const AuthCard: React.FC<AuthCardProps> = ({ 
  onLogin, 
  onRegister, 
  onGuestLogin, 
  colorMode, 
  setColorMode 
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const isDark = colorMode === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      try {
        await onRegister(username, password, email);
        setIsRegistering(false);
        setEmail('');
      } catch (err) {
        console.error("Registration Error:", err);
      }
    } else {
      onLogin(username, password);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500 bg-white dark:bg-[#020617]">
      
      <div className="absolute top-8 right-8 z-50">
        <button 
          type="button"
          onClick={() => setColorMode(isDark ? 'light' : 'dark')}
          className="group flex items-center gap-3 p-2 pr-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <div className="p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm transition-transform duration-300 group-hover:rotate-12">
            {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-500" />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
            {isDark ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] bg-blue-600/10 dark:bg-blue-600/20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] bg-purple-600/10 dark:bg-purple-600/20" />
      </div>

      <div className="z-10 text-center mb-10">
        <h1 className="text-7xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-600 dark:from-white dark:to-slate-500">
          CHESS PLATFORM
        </h1>
        <p className="text-[11px] font-black tracking-[0.6em] uppercase text-slate-500 dark:text-slate-400">
          Real-Time Multiplayer Experience
        </p>
      </div>

      <div className="z-10 w-full max-w-[460px] p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl transition-all duration-500">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {isRegistering && (
              <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[12px] font-black uppercase tracking-widest mb-3 text-slate-950 dark:text-white ml-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required={isRegistering}
                    className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-14 pr-6 py-5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </section>
            )}

            <section>
              <label className="block text-[12px] font-black uppercase tracking-widest mb-3 text-slate-950 dark:text-white ml-2">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-14 pr-6 py-5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold text-slate-900 dark:text-white"
                />
              </div>
            </section>

            <section>
              <label className="block text-[12px] font-black uppercase tracking-widest mb-3 text-slate-950 dark:text-white ml-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl pl-14 pr-6 py-5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold text-slate-900 dark:text-white"
                />
              </div>
            </section>
          </div>

          <button 
            type="submit"
            className="w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm transition-all bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-3 group"
          >
            {isRegistering ? 'Create Account' : 'Sign In'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <span className="relative px-4 bg-slate-50 dark:bg-[#020617] text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-full transition-colors duration-500">OR</span>
          </div>

          <button 
            type="button"
            onClick={onGuestLogin}
            className="w-full py-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-3 group"
          >
            <UserPlus size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Play as Guest
            </span>
          </button>

          <p className="text-center">
            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setEmail('');
              }}
              className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
          </p>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/50 flex flex-col items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 dark:bg-green-500/5 border border-green-500/20">
              <ShieldCheck size={16} className="text-green-600 dark:text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-700 dark:text-green-500">
                End-to-End Encryption
              </span>
           </div>
           
           <a 
             href="https://github.com/BatuhanBaysal/chess-platform" 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
           >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest">
                Open Source Repository
              </span>
           </a>

           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-50">
             Identity Service v1.0
           </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
