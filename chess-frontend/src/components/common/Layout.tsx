import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  colorMode: string;
  setColorMode: React.Dispatch<React.SetStateAction<string>>;
  view?: 'MENU' | 'GAME' | 'PROFILE'; 
  onBackToMenu?: () => void;
  onNavigateToProfile?: () => void; 
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  colorMode, 
  setColorMode, 
  view, 
  onBackToMenu,
  onNavigateToProfile 
}) => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Header 
        colorMode={colorMode} 
        setColorMode={setColorMode}
        view={view} 
        onBackToMenu={onBackToMenu}
        onNavigateToProfile={onNavigateToProfile}
      />
      
      <main className="grow flex flex-col justify-center items-center w-full py-12">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
