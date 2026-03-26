import { useDroppable } from '@dnd-kit/core';

interface SquareProps {
  id: string; 
  children: React.ReactNode;
}

export function Square({ id, children }: SquareProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const style = {
    backgroundColor: isOver ? 'rgba(255, 255, 0, 0.4)' : undefined, 
  };

  return (
    <div ref={setNodeRef} style={style} className="relative w-full h-full flex items-center justify-center">
      {children}
    </div>
  );
}
