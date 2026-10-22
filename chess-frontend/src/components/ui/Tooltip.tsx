import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  className = 'relative inline-flex items-center'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={className}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          role="tooltip"
          className={`absolute left-1/2 -translate-x-1/2 z-50 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-slate-900/95 dark:bg-slate-800/95 rounded-lg shadow-xl backdrop-blur-xs whitespace-nowrap pointer-events-none border border-slate-700/50 transition-all duration-150 animate-in fade-in zoom-in-95 ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {content}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/95 dark:bg-slate-800/95 rotate-45 border-slate-700/50 ${
              position === 'top' 
                ? 'top-full -mt-1 border-r border-b' 
                : 'bottom-full -mb-1 border-l border-t'
            }`} 
          />
        </div>
      )}
    </div>
  );
};
