import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [colorMode, setColorMode] = useState<string>(() => {
    return localStorage.getItem('chess_color_mode') || 'dark';
  });

  useEffect(() => {
    const html = window.document.documentElement;
    if (colorMode === 'dark') {
      html.classList.add('dark');
      document.body.style.backgroundColor = '#020617';
    } else {
      html.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
    }
    localStorage.setItem('chess_color_mode', colorMode);
  }, [colorMode]);

  const toggleTheme = () => {
    setColorMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { colorMode, setColorMode, toggleTheme };
};
