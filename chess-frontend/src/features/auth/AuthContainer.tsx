import React from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import AuthForm from './AuthForm';

interface AuthContainerProps {
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string, email: string) => Promise<void> | void;
  onGuestLogin: () => void;
  colorMode: string;
  setColorMode: React.Dispatch<React.SetStateAction<string>>;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ 
  onLogin, 
  onRegister, 
  onGuestLogin,
  colorMode,
  setColorMode
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#020617] transition-colors duration-500">
      <Header colorMode={colorMode} setColorMode={setColorMode} />
 
      <main className="grow flex flex-col items-center justify-center px-6 pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] bg-blue-600/10 dark:bg-blue-600/20" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] bg-purple-600/10 dark:bg-purple-600/20" />
        </div>

        <div className="z-10 w-full max-w-115 p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl transition-all duration-500">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter mb-2 text-slate-950 dark:text-white">
              CHESS PLATFORM
            </h1>
          </div>
          
          <AuthForm 
            onLogin={onLogin} 
            onRegister={onRegister} 
            onGuestLogin={onGuestLogin} 
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthContainer;
