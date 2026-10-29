import { DndContext, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DroppableSquare } from './DroppableSquare';
import { DraggablePiece } from './DraggablePiece';

interface BoardGridProps {
  sensors: any;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  squares: string[];
  orientation: 'WHITE' | 'BLACK';
  selectedSquare: number | null;
  legalMoves: { file: number; rank: number }[];
  isCheck: boolean;
  currentTurn: string;
  isStarted: boolean;
  isGameOver: boolean;
  isMyTurn: boolean;
  currentTheme: { 
    dark: string; 
    light: string; 
    previewDark: string; 
    previewLight: string; 
  };
  activePiece: { char: string; index: number } | null;
  pieceImages: Record<string, string>;
  getActualIndex: (visualIndex: number) => number;
  getCoordsFromIndex: (index: number) => { file: number; rank: number };
  handleSquareClick: (actualIndex: number) => void;
}

const getSquareBackgroundColor = (
  isKingInDanger: boolean,
  isDark: boolean,
  theme: BoardGridProps['currentTheme']
): string | undefined => {
  if (isKingInDanger) {
    return undefined;
  }
  return isDark ? theme.previewDark : theme.previewLight;
};

export const BoardGrid = ({
  sensors, onDragStart, onDragEnd, squares, orientation, selectedSquare,
  legalMoves, isCheck, currentTurn, isStarted, isGameOver, isMyTurn,
  currentTheme, activePiece, pieceImages, getActualIndex, getCoordsFromIndex, handleSquareClick
}: Readonly<BoardGridProps>) => {
  return (
    <div className="relative flex justify-center w-full xl:w-156 xl:h-156">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {/* Seamless 8x8 Board Container */}
        <div 
          className="grid grid-cols-8 grid-rows-8 border-slate-300 dark:border-slate-900 bg-slate-300 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl transition-colors box-border touch-none w-full aspect-square xl:w-156 xl:h-156 border-8 sm:border-12 border-solid gap-0 p-0 m-0"
        >
          {Array.from({ length: 64 }).map((_, visualIndex) => {
            const actualIndex = getActualIndex(visualIndex);
            const char = squares[actualIndex];
            const { file: col, rank: displayRank } = getCoordsFromIndex(actualIndex);
            const isDark = (Math.floor(visualIndex / 8) + (visualIndex % 8)) % 2 === 1;
            const isSelected = selectedSquare === actualIndex;
            const isLegalTarget = legalMoves.some(m => m.file === col && m.rank === displayRank);
            const isKingInDanger = isCheck && ((currentTurn?.toUpperCase() === 'WHITE' && char === 'K') || (currentTurn?.toUpperCase() === 'BLACK' && char === 'k'));
            
            const disabled = Boolean(!isStarted || !isMyTurn || isGameOver || ((orientation === 'WHITE' && char === char.toLowerCase()) || (orientation === 'BLACK' && char === char.toUpperCase())));
            const backgroundColor = getSquareBackgroundColor(isKingInDanger, isDark, currentTheme);

            return (
              <DroppableSquare 
                key={visualIndex} 
                index={visualIndex} 
                onClick={() => handleSquareClick(actualIndex)} 
                style={{ backgroundColor }}
                className={`relative flex items-center justify-center w-full h-full ${isSelected ? 'ring-3 sm:ring-4 ring-indigo-500/70 z-30' : ''} ${isKingInDanger ? 'bg-red-600! animate-pulse z-20' : ''}`}
              >
                {/* File & Rank Coordinates */}
                {col === (orientation === 'WHITE' ? 0 : 7) && (
                  <span className="absolute left-1 top-0.5 sm:left-1.5 sm:top-1 text-[10px] sm:text-sm font-black text-slate-900 z-10 drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.6)] select-none pointer-events-none">
                    {displayRank + 1}
                  </span>
                )}
                {displayRank === (orientation === 'WHITE' ? 0 : 7) && (
                  <span className="absolute right-1 bottom-0.5 sm:right-1.5 sm:bottom-1 text-[10px] sm:text-sm font-black text-slate-900 z-10 drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.6)] select-none pointer-events-none">
                    {String.fromCodePoint(97 + col)}
                  </span>
                )}
                {isLegalTarget && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-indigo-900/25 dark:bg-black/25 rounded-full" />
                  </div>
                )}
                {char !== '.' && (
                  <DraggablePiece char={char} index={visualIndex} isSelected={isSelected} disabled={disabled} pieceImages={pieceImages} />
                )}
              </DroppableSquare>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{ duration: 150, sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
          {activePiece ? (
            <div className="w-14 h-14 sm:w-17.5 sm:h-17.5 flex items-center justify-center cursor-grabbing scale-110">
              <img src={pieceImages[activePiece.char]} alt="dragging" className="w-full h-full drop-shadow-2xl" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default BoardGrid;
