import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [isSuccessView, setIsSuccessView] = useState(false);

  const isSignUp = location.pathname === '/sign-up' || location.pathname === '/register';

  const getAuthBgImage = () => {
    if (isSuccessView) return '/assets/images/auth/auth-welcome-bg.jpg';
    if (isSignUp) return '/assets/images/auth/auth-signup-bg.jpg';
    return '/assets/images/auth/auth-signin-bg.jpg';
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center py-2 sm:py-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Showcase Panel */}
        <div className="order-2 lg:order-1 relative overflow-hidden bg-slate-950 border border-slate-200/90 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-slate-950/5 dark:shadow-slate-950/40 h-auto lg:h-166.25 flex flex-col justify-between">
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <img 
              src="/assets/images/chess-platform.jpg" 
              alt="Chess Platform Arena" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/35 to-slate-950/70" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <AuthShowcase onGuestLogin={onGuestLogin} />
          </div>
        </div>

        {/* Dynamic Thematic Form Panel */}
        <div className="order-1 lg:order-2 relative overflow-hidden rounded-[2.5rem] border border-slate-200/90 dark:border-slate-800/80 shadow-xl shadow-slate-950/5 dark:shadow-slate-950/40 h-auto lg:h-166.25 transition-all duration-500 bg-slate-950">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none select-none transform scale-105"
            style={{ backgroundImage: `url(${getAuthBgImage()})` }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/85 via-slate-950/80 to-slate-950/95 backdrop-blur-xs pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between h-full">
            <AuthForm 
              onLogin={onLogin} 
              onRegister={onRegister}
              onSuccessChange={setIsSuccessView}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
