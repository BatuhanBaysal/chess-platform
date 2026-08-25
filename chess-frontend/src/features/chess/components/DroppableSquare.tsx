import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableSquareProps {
  index: number;
  children: React.ReactNode;
  className: string;
  onClick: () => void;
}

export const DroppableSquare: React.FC<DroppableSquareProps> = ({ index, children, className, onClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `square-${index}` });
  
  return (
    <div ref={setNodeRef} onClick={onClick} className={`${className} ${isOver ? 'brightness-110 contrast-125' : ''}`}>
      {children}
    </div>
  );
};
