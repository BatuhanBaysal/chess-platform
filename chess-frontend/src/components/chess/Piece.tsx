import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface PieceProps {
  id: string;
  type: string; 
  position: { r: number; c: number };
}

export function DraggablePiece({ id, type, position }: PieceProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: {
      from: position, 
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: 'grab',
    touchAction: 'none', 
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="z-10 flex items-center justify-center w-full h-full"
    >

      <img src={`/assets/pieces/${type}.svg`} alt={type} className="w-[85%] h-[85%] select-none" />
    </div>
  );
}
