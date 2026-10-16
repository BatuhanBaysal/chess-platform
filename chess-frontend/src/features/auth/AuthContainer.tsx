import React from 'react';
import { AuthShowcase } from './AuthShowcase';
import { AuthForm } from './AuthForm';

interface AuthContainerProps {
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string, email: string) => Promise<void> | void;
  onGuestLogin: () => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  onLogin,
  onRegister,
  onGuestLogin
}) => {
  return (
    <div className="w-full flex-1 flex items-center justify-center py-2 sm:py-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Showcase Panel Background */}
        <div className="order-2 lg:order-1 relative overflow-hidden bg-slate-950 border border-slate-200/90 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-slate-950/5 dark:shadow-slate-950/40 h-auto lg:h-166.25 flex flex-col justify-between">
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <img 
              src="/assets/images/chess-platform.jpg" 
              alt="Chess Platform Arena" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/35 to-slate-950/70" />
          </div>

          {/* Showcase Content */}
          <div className="relative z-10 flex flex-col justify-between h-full">
            <AuthShowcase onGuestLogin={onGuestLogin} />
          </div>
        </div>

        {/* Form Panel */}
        <div className="order-1 lg:order-2 bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-slate-950/5 dark:shadow-slate-950/40 h-auto lg:h-166.25 flex flex-col justify-between">
          <AuthForm onLogin={onLogin} onRegister={onRegister} />
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
