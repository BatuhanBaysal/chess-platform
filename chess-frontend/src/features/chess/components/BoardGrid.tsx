import React from 'react';
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
  pieceImages: { [key: string]: string };
  getActualIndex: (visualIndex: number) => number;
  getCoordsFromIndex: (index: number) => { file: number; rank: number };
  handleSquareClick: (actualIndex: number) => void;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  sensors, onDragStart, onDragEnd, squares, orientation, selectedSquare,
  legalMoves, isCheck, currentTurn, isStarted, isGameOver, isMyTurn,
  currentTheme, activePiece, pieceImages, getActualIndex, getCoordsFromIndex, handleSquareClick
}) => {
  return (
    <div className="relative flex justify-center">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div 
          className="grid grid-cols-8 grid-rows-8 border-slate-200 dark:border-slate-900 bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl transition-colors box-border" 
          style={{ width: '624px', height: '624px', borderWidth: '12px', borderStyle: 'solid' }}
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

            return (
              <DroppableSquare 
                key={visualIndex} 
                index={visualIndex} 
                onClick={() => handleSquareClick(actualIndex)} 
                style={{ backgroundColor: isDark ? currentTheme.previewDark : currentTheme.previewLight }}
                className={`relative flex items-center justify-center aspect-square ${isSelected ? 'ring-4 ring-blue-500/50 z-30' : ''} ${isKingInDanger ? 'bg-red-600/90 animate-pulse' : ''}`}
              >
                {col === (orientation === 'WHITE' ? 0 : 7) && (
                  <span className="absolute left-1.5 top-1 text-base font-black text-slate-900 z-10 drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.5)]">
                    {displayRank + 1}
                  </span>
                )}
                {displayRank === (orientation === 'WHITE' ? 0 : 7) && (
                  <span className="absolute right-1.5 bottom-1 text-base font-black text-slate-900 z-10 drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.5)]">
                    {String.fromCharCode(97 + col)}
                  </span>
                )}
                {isLegalTarget && 
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-4 h-4 bg-black/10 rounded-full" />
                  </div>}
                {char !== '.' && (
                  <DraggablePiece char={char} index={visualIndex} isSelected={isSelected} disabled={disabled} pieceImages={pieceImages} />
                )}
              </DroppableSquare>
            );
          })}
        </div>
        <DragOverlay dropAnimation={{ duration: 150, sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
          {activePiece ? (
            <div className="w-17.5 h-17.5 flex items-center justify-center cursor-grabbing scale-110">
              <img src={pieceImages[activePiece.char]} alt="dragging" className="w-full h-full drop-shadow-2xl" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default BoardGrid;
