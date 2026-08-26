import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onBackToMenu?: () => void;
  isInGame?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onBackToMenu,
  isInGame
}) => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Header 
        onBackToMenu={onBackToMenu}
        isInGame={isInGame}
      />
      
      <main className="grow flex flex-col justify-center items-center w-full pt-32 pb-12 px-4">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
