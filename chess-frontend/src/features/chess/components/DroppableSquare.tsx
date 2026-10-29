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
    <button
      type="button"
      ref={setNodeRef} 
      aria-label={`Chess square ${index}`}
      onClick={onClick}
      style={style} 
      className={`${className} ${isOver ? 'brightness-110 contrast-125' : ''} p-0 border-0 bg-transparent cursor-pointer`}
    >
      {children}
    </button>
  );
};

export default DroppableSquare;
