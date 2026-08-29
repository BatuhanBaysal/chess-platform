import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableSquareProps {
  index: number;
  children: React.ReactNode;
  className: string;
  style?: React.CSSProperties;
  onClick: () => void;
}

export const DroppableSquare: React.FC<DroppableSquareProps> = ({ index, children, className, style, onClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `square-${index}` });
  
  return (
    <div 
      ref={setNodeRef} 
      onClick={onClick} 
      style={style} 
      className={`${className} ${isOver ? 'brightness-110 contrast-125' : ''}`}
    >
      {children}
    </div>
  );
};
