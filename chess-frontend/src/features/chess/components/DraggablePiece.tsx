import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggablePieceProps {
  char: string;
  index: number;
  isSelected: boolean;
  disabled: boolean;
  pieceImages: { [key: string]: string };
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({ char, index, isSelected, disabled, pieceImages }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `piece-${index}`,
    data: { index, char },
    disabled: disabled
  });
  
  const style = { 
    transform: CSS.Translate.toString(transform), 
    zIndex: isDragging ? 1000 : 10, 
    opacity: isDragging ? 0.6 : 1 
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...(disabled ? {} : listeners)} 
      {...(disabled ? {} : attributes)} 
      className={`w-full h-full flex items-center justify-center transition-transform ${disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${isSelected ? 'scale-110' : ''}`}
    >
      <img src={pieceImages[char]} alt={char} className="w-[85%] h-[85%] pointer-events-none drop-shadow-md" />
    </div>
  );
};
