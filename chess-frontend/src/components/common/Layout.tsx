import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onBackToMenu?: () => void;
  isInGame?: boolean;
  activeGameId?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onBackToMenu,
  isInGame,
  activeGameId
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      <Header 
        onBackToMenu={onBackToMenu}
        isInGame={isInGame}
        activeGameId={activeGameId}
      />
      
      <main className="grow flex flex-col justify-start items-center w-full max-w-full overflow-x-hidden pt-20 pb-8 px-4 sm:px-6">
        {children}
      </main>

      <Footer isInGame={isInGame} />
    </div>
  );
};

export default Layout;
