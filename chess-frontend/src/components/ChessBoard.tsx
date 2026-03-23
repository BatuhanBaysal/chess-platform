import React, { useState } from 'react';

interface ChessBoardProps {
  boardRepresentation: string;
  onMove: (fromFile: number, fromRank: number, toFile: number, toRank: number) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ boardRepresentation, onMove }) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);

  const squares = boardRepresentation ? boardRepresentation.slice(0, 64).split('') : [];

  const getPieceSymbol = (char: string) => {
    const symbols: { [key: string]: string } = {
      'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟', 
      'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙', 
      '.': ''
    };
    return symbols[char] || '';
  };

  const handleSquareClick = (index: number) => {
    if (selectedSquare === null) {
      if (squares[index] !== '.') {
        setSelectedSquare(index);
      }
    } else {
      const fromFile = selectedSquare % 8;
      const fromRank = 7 - Math.floor(selectedSquare / 8);
      const toFile = index % 8;
      const toRank = 7 - Math.floor(index / 8);

      onMove(fromFile, fromRank, toFile, toRank);
      
      setSelectedSquare(null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="grid grid-cols-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[12px] border-slate-800 bg-slate-400 overflow-hidden rounded-sm"
        style={{ width: '480px', height: '480px' }}
      >
        {squares.map((char, index) => {
          const row = Math.floor(index / 8);
          const col = index % 8;
          const isDark = (row + col) % 2 === 1;
          const isSelected = selectedSquare === index;

          return (
            <div
              key={index}
              onClick={() => handleSquareClick(index)}
              className={`
                flex items-center justify-center text-5xl select-none cursor-pointer
                transition-all duration-150
                ${isDark ? 'bg-slate-600' : 'bg-slate-300'}
                ${isSelected ? 'ring-4 ring-yellow-400 z-10 bg-yellow-400/30 shadow-inner' : 'hover:bg-blue-200/30'}
              `}
              style={{ width: '58.5px', height: '58.5px' }}
            >
              <span className={`
                ${char === char.toUpperCase() && char !== '.' ? 'text-black' : 'text-white'}
                drop-shadow-md
              `}>
                {getPieceSymbol(char)}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex gap-4 text-slate-400 font-mono text-xs uppercase tracking-widest">
        <div className={`px-2 py-1 rounded ${selectedSquare !== null ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-800'}`}>
          {selectedSquare !== null 
            ? `From: [${selectedSquare % 8}, ${7 - Math.floor(selectedSquare / 8)}]` 
            : 'Select Piece'}
        </div>
        <div className="px-2 py-1 bg-slate-800 rounded">
          64 SQUARES READY
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
