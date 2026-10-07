import React from 'react';
import AuthForm from './AuthForm';

interface AuthContainerProps {
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string, email: string) => Promise<void> | void;
  onGuestLogin: () => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ 
  onLogin, 
  onRegister, 
  onGuestLogin
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center relative overflow-hidden py-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] bg-blue-600/10 dark:bg-blue-600/20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] bg-purple-600/10 dark:bg-purple-600/20" />
      </div>

      <div className="z-10 w-full max-w-md p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl transition-all duration-500">
        <AuthForm 
          onLogin={onLogin} 
          onRegister={onRegister} 
          onGuestLogin={onGuestLogin} 
        />
      </div>
    </div>
  );
};

export default AuthContainer;
