import React, { useState } from 'react';

interface ChessBoardProps {
  boardRepresentation: string;
  onMove: (fromFile: number, fromRank: number, toFile: number, toRank: number, promotion?: string) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ boardRepresentation, onMove }) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [promotionPending, setPromotionPending] = useState<{from: number, to: number} | null>(null);

  const squares = boardRepresentation 
    ? boardRepresentation.split('|')[0].slice(0, 64).split('') 
    : Array(64).fill('.');

  const getPieceSymbol = (char: string) => {
    let iconKey = char;
    if (char === 'QUEEN') iconKey = 'Q';
    if (char === 'ROOK') iconKey = 'R';
    if (char === 'BISHOP') iconKey = 'B';
    if (char === 'KNIGHT') iconKey = 'N';

    const symbols: { [key: string]: string } = {
      'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙', 
      'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟', 
      '.': ''
    };
    return symbols[iconKey] || '';
  };

  const handleSquareClick = (index: number) => {
    if (selectedSquare === null) {
      if (squares[index] !== '.') {
        setSelectedSquare(index);
      }
      return;
    }

    const fromFile = selectedSquare % 8;
    const fromRank = 7 - Math.floor(selectedSquare / 8);
    const toFile = index % 8;
    const toRank = 7 - Math.floor(index / 8);

    const movingPiece = squares[selectedSquare];
    const isPawn = movingPiece.toLowerCase() === 'p';

    const isWhitePromotion = movingPiece === 'P' && toRank === 7;
    const isBlackPromotion = movingPiece === 'p' && toRank === 0;

    if (isPawn && (isWhitePromotion || isBlackPromotion)) {
      setPromotionPending({ from: selectedSquare, to: index });
      return; 
    } else {
      onMove(fromFile, fromRank, toFile, toRank);
      setSelectedSquare(null);
    }
  };

  const completePromotion = (pieceType: string) => {
    if (!promotionPending) return;
    
    const fromFile = promotionPending.from % 8;
    const fromRank = 7 - Math.floor(promotionPending.from / 8);
    const toFile = promotionPending.to % 8;
    const toRank = 7 - Math.floor(promotionPending.to / 8);

    onMove(fromFile, fromRank, toFile, toRank, pieceType);
    
    setPromotionPending(null);
    setSelectedSquare(null); 
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {promotionPending && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md rounded-lg">
          <div className="bg-slate-800 p-8 rounded-2xl border-2 border-blue-500 shadow-2xl text-center">
            <h3 className="text-blue-400 font-bold mb-6 text-lg tracking-widest uppercase">Terfi Seçin</h3>
            <div className="flex gap-4">
              {['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'].map((type) => (
                <button 
                  key={type}
                  onClick={() => completePromotion(type)}
                  className="w-20 h-20 bg-slate-700 hover:bg-blue-600 rounded-xl text-5xl transition-all transform hover:scale-110 active:scale-90 flex items-center justify-center text-white"
                >
                  {getPieceSymbol(type)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div 
        className="grid grid-cols-8 grid-rows-8 shadow-2xl border-[12px] border-slate-800 bg-slate-800 rounded-sm overflow-hidden" 
        style={{ width: '480px', height: '480px' }}
      >
        {squares.map((char, index) => {
          const row = Math.floor(index / 8);
          const col = index % 8;
          const isDark = (row + col) % 2 === 1;
          const isSelected = selectedSquare === index;
          const isWhitePiece = char !== '.' && char === char.toUpperCase();

          return (
            <div
              key={index}
              onClick={() => handleSquareClick(index)}
              className={`relative flex items-center justify-center text-5xl cursor-pointer transition-all duration-75 aspect-square
                ${isDark ? 'bg-slate-600' : 'bg-slate-300'}
                ${isSelected ? 'bg-yellow-400/60 ring-4 ring-yellow-400 ring-inset' : 'hover:bg-blue-200/40'}`}
            >
              {char !== '.' && (
                <span className={`${isWhitePiece ? 'text-white' : 'text-black'} drop-shadow-md z-10`}>
                  {getPieceSymbol(char)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChessBoard;
