import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ChessBoardProps {
  boardRepresentation: string;
  gameStatus: string;
  currentTurn: string;
  moveHistory: string[];
  lastMoveMessage: string;
  onMove: (fromFile: number, fromRank: number, toFile: number, toRank: number, promotion?: string) => void;
  fetchLegalMoves?: (file: number, rank: number) => Promise<{ file: number, rank: number }[]>;
  onNewGame?: () => void;
}

const PIECE_IMAGES: { [key: string]: string } = {
  'P': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  'R': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  'N': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  'B': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  'Q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  'K': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
};

const PIECE_VALUES: { [key: string]: number } = {
  'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100,
  'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100,
};

const INITIAL_PIECES = {
  white: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'N', 'N', 'B', 'B', 'R', 'R', 'Q', 'K'],
  black: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q', 'k']
};

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  boardRepresentation, 
  gameStatus, 
  currentTurn, 
  moveHistory,
  lastMoveMessage,
  onMove, 
  fetchLegalMoves, 
  onNewGame 
}) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: number, to: number } | null>(null);
  const [legalMoves, setLegalMoves] = useState<{ file: number, rank: number }[]>([]);
  const [logs, setLogs] = useState<{text: string, turn: string, time: string}[]>([]);
  
  const lastProcessedMessage = useRef<string | null>(null);

  const boardData = boardRepresentation.split('|');
  const squares = boardData[0] ? boardData[0].slice(0, 64).split('') : Array(64).fill('.');

  useEffect(() => {
    setLegalMoves([]);
    setSelectedSquare(null);
    
    if (lastMoveMessage && lastMoveMessage !== lastProcessedMessage.current) {
      const isError = lastMoveMessage.includes("Illegal") || lastMoveMessage.includes("not your turn");
      const isStart = lastMoveMessage.includes("Game started");
      
      let moveColor = "";
      if (!isError && !isStart) {
        moveColor = currentTurn.toUpperCase() === 'WHITE' ? 'BLACK' : 'WHITE';
      }
      
      const newLog = {
        text: lastMoveMessage,
        turn: moveColor,
        time: new Date().toLocaleTimeString([], { hour12: false })
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50));
      lastProcessedMessage.current = lastMoveMessage;
    }
  }, [boardRepresentation, lastMoveMessage, currentTurn]);

  const getCapturedPieces = useCallback(() => {
    const currentWhite = squares.filter(s => s !== '.' && s === s.toUpperCase());
    const currentBlack = squares.filter(s => s !== '.' && s === s.toLowerCase());
    
    let tempWhite = [...INITIAL_PIECES.white];
    currentWhite.forEach(p => {
      const idx = tempWhite.indexOf(p);
      if (idx > -1) tempWhite.splice(idx, 1);
    });
    
    let tempBlack = [...INITIAL_PIECES.black];
    currentBlack.forEach(p => {
      const idx = tempBlack.indexOf(p);
      if (idx > -1) tempBlack.splice(idx, 1);
    });

    const whiteScore = tempBlack.reduce((acc, p) => acc + PIECE_VALUES[p], 0);
    const blackScore = tempWhite.reduce((acc, p) => acc + PIECE_VALUES[p], 0);

    return {
      whiteCaptured: tempBlack.sort((a, b) => PIECE_VALUES[a] - PIECE_VALUES[b]),
      blackCaptured: tempWhite.sort((a, b) => PIECE_VALUES[a] - PIECE_VALUES[b]),
      advantage: whiteScore - blackScore
    };
  }, [squares]);

  const { whiteCaptured, blackCaptured, advantage } = getCapturedPieces();

  const handleSquareClick = async (index: number) => {
    const isGameOver = ['CHECKMATE', 'STALEMATE', 'DRAW', 'RESIGNED'].includes(gameStatus.toUpperCase());
    if (isGameOver) return;
    
    const file = index % 8;
    const rank = 7 - Math.floor(index / 8);
    const pieceAtTarget = squares[index];

    if (selectedSquare === null) {
      const isWhite = pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toUpperCase();
      const isBlack = pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toLowerCase();
      const isOwnPiece = (currentTurn.toLowerCase() === 'white' && isWhite) || 
                         (currentTurn.toLowerCase() === 'black' && isBlack);

      if (isOwnPiece) {
        setSelectedSquare(index);
        if (fetchLegalMoves) {
          const moves = await fetchLegalMoves(file, rank);
          setLegalMoves(moves);
        }
      }
      return;
    }

    if (selectedSquare === index) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const isLegal = legalMoves.some(m => m.file === file && m.rank === rank);
    
    if (isLegal) {
      const fromFile = selectedSquare % 8;
      const fromRank = 7 - Math.floor(selectedSquare / 8);
      const movingPiece = squares[selectedSquare];
      const isPawn = movingPiece.toLowerCase() === 'p';
      const isPromotion = isPawn && (rank === 7 || rank === 0);
      
      if (isPromotion) {
        setPromotionPending({ from: selectedSquare, to: index });
      } else {
        onMove(fromFile, fromRank, file, rank);
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else {
      const isWhite = pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toUpperCase();
      const isBlack = pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toLowerCase();
      const isOwnPiece = (currentTurn.toLowerCase() === 'white' && isWhite) || 
                         (currentTurn.toLowerCase() === 'black' && isBlack);

      if (isOwnPiece) {
        setSelectedSquare(index);
        if (fetchLegalMoves) {
          const moves = await fetchLegalMoves(file, rank);
          setLegalMoves(moves);
        }
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const completePromotion = (pieceType: string) => {
    if (!promotionPending) return;
    const { from, to } = promotionPending;
    onMove(from % 8, 7 - Math.floor(from / 8), to % 8, 7 - Math.floor(to / 8), pieceType);
    setPromotionPending(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const renderMoveHistory = () => {
    const rows = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      rows.push(
        <div key={i} className="grid grid-cols-7 gap-1 border-b border-slate-700/50 py-2 px-2 hover:bg-slate-800/50 transition-colors">
          <span className="col-span-1 text-slate-500 font-bold text-[10px]">{Math.floor(i / 2) + 1}.</span>
          <span className="col-span-3 text-slate-200 text-xs font-mono text-center">{moveHistory[i]}</span>
          <span className="col-span-3 text-slate-200 text-xs font-mono text-center">{moveHistory[i + 1] || ""}</span>
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="flex flex-col xl:flex-row items-stretch justify-center gap-6 p-8 bg-[#0f172a] rounded-2xl shadow-2xl max-w-[1550px]">
      
      {promotionPending && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center min-w-[360px] gap-6 animate-in zoom-in-95">
            <h3 className="text-white font-black uppercase text-xs tracking-[0.3em] bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/30">Promotion</h3>
            <div className="grid grid-cols-2 gap-4 w-full">
              {['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'].map((type) => {
                const pieceKey = type === 'KNIGHT' ? 'N' : type[0];
                const finalKey = currentTurn.toUpperCase() === 'WHITE' ? pieceKey : pieceKey.toLowerCase();
                return (
                  <button key={type} onClick={() => completePromotion(type)} className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-blue-600/20 hover:border-blue-500/50 transition-all group">
                    <img src={PIECE_IMAGES[finalKey]} className="w-16 h-16 group-hover:scale-110 transition-transform" alt={type} />
                    <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase group-hover:text-blue-400">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="w-32 bg-slate-900/40 border border-slate-700/50 rounded-xl flex flex-col justify-between p-3 py-4 backdrop-blur-sm h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <div className="grid grid-cols-2 gap-1 overflow-y-auto modern-scroll max-h-[220px]">
            {blackCaptured.map((p, i) => (<img key={i} src={PIECE_IMAGES[p]} className="w-6 h-6 opacity-60 grayscale hover:grayscale-0 transition-all" alt="cap" />))}
          </div>
          {advantage < 0 && <span className="text-[10px] font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">+{Math.abs(advantage)}</span>}
        </div>
        <div className="h-px bg-slate-700/30 w-full my-4" />
        <div className="flex flex-col items-center gap-2">
          {advantage > 0 && <span className="text-[10px] font-black bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">+{advantage}</span>}
          <div className="grid grid-cols-2 gap-1 overflow-y-auto modern-scroll max-h-[220px]">
            {whiteCaptured.map((p, i) => (<img key={i} src={PIECE_IMAGES[p]} className="w-6 h-6 opacity-60 grayscale hover:grayscale-0 transition-all" alt="cap" />))}
          </div>
        </div>
      </div>

      <div className="relative select-none">
        {gameStatus === 'CHECKMATE' && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md rounded-lg">
            <div className="bg-slate-800 border-2 border-yellow-500/50 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center">
              <span className="text-4xl mb-4">🏆</span>
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Checkmate!</h2>
              <p className="text-slate-400 text-sm mb-6 uppercase font-bold tracking-widest">{currentTurn.toUpperCase() === 'WHITE' ? 'BLACK' : 'WHITE'} Wins</p>
              <button onClick={onNewGame} className="w-full py-3 px-6 bg-yellow-500 text-slate-900 font-black rounded-xl uppercase text-xs tracking-widest hover:bg-yellow-400">New Game</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-8 grid-rows-8 border-[12px] border-slate-900 bg-slate-900 rounded-lg shadow-2xl" style={{ width: '600px', height: '600px' }}>
          {squares.map((char, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const currentRank = 7 - row;
            const isDark = (row + col) % 2 === 1;
            const isSelected = selectedSquare === index;
            const isLegalTarget = legalMoves.some(m => m.file === col && m.rank === currentRank);
            const isCheck = gameStatus === 'CHECK' || gameStatus === 'CHECKMATE';
            const isKingInDanger = isCheck && ((currentTurn.toUpperCase() === 'WHITE' && char === 'K') || (currentTurn.toUpperCase() === 'BLACK' && char === 'k'));

            return (
              <div key={index} onClick={() => handleSquareClick(index)} className={`relative flex items-center justify-center cursor-pointer transition-all aspect-square ${isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'} ${isSelected ? 'bg-blue-500/50 shadow-[inset_0_0_0_4px_#3b82f6] z-10' : 'hover:brightness-110'} ${isKingInDanger ? 'bg-red-600/90 shadow-[0_0_20px_rgba(220,38,38,0.8)] z-50 animate-pulse' : ''}`}>
                {col === 0 && <span className={`absolute left-1 top-0.5 text-[10px] font-bold ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>{currentRank + 1}</span>}
                {row === 7 && <span className={`absolute right-1 bottom-0.5 text-[10px] font-bold ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>{String.fromCharCode(97 + col)}</span>}
                {isLegalTarget && (<div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">{char === '.' ? (<div className="w-4 h-4 bg-black/15 rounded-full" />) : (<div className="w-full h-full border-[8px] border-black/10 rounded-full" />)}</div>)}
                {char !== '.' && (
                  <div className={`w-[90%] h-[90%] transition-transform z-10 ${isSelected ? 'scale-110' : ''}`}>
                    <img src={PIECE_IMAGES[char]} alt={char} className="w-full h-full pointer-events-none drop-shadow-md" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 h-[600px]">
        <div className="w-[400px] bg-slate-900/50 border border-slate-700/50 rounded-xl flex flex-col overflow-hidden backdrop-blur-md">
          <div className="bg-slate-800 p-4 border-b border-slate-700">
            <h2 className="text-white text-[10px] font-black uppercase tracking-[0.2em] text-center">Live Operations</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 modern-scroll">
            {logs.length === 0 && <div className="h-full flex items-center justify-center opacity-20 text-[10px] font-bold">READY...</div>}
            {logs.map((log, i) => {
              const isError = log.text.includes("Illegal") || log.text.includes("not your turn");
              const isCheck = log.text.includes("CHECK");
              
              return (
                <div key={i} className={`text-[11px] p-3 rounded-lg border-l-2 leading-relaxed transition-all animate-in slide-in-from-right-2
                  ${isError ? "bg-red-500/10 border-red-500 text-red-200" : 
                    isCheck ? "bg-red-600/20 border-red-500 text-red-100 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]" : 
                    "bg-slate-800/40 border-blue-500 text-slate-300"}`}>
                  
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="opacity-40 font-mono text-[9px]">{log.time}</span>
                    {log.turn && (
                       <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter
                         ${log.turn === 'WHITE' ? 'bg-white text-black' : 'bg-slate-700 text-white border border-slate-600'}`}>
                         {log.turn}
                       </span>
                    )}
                  </div>
                  <span className={`font-semibold tracking-wide ${isCheck ? "animate-pulse" : ""}`}>
                    {log.text.startsWith("Game") || log.text.includes("WHITE") || log.text.includes("BLACK") 
                      ? log.text 
                      : `${log.turn} ${log.text}`}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={`p-3 text-center text-[10px] font-black uppercase tracking-widest border-t border-slate-800/50 ${gameStatus === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>STATUS: {gameStatus}</div>
        </div>

        <div className="w-64 bg-slate-900/50 border border-slate-700/50 rounded-xl flex flex-col overflow-hidden backdrop-blur-md shadow-2xl h-full">
          <div className="bg-slate-800/80 p-3 border-b border-slate-700 flex items-center justify-between shrink-0">
            <h2 className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Live Notation</h2>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-7 gap-1 bg-slate-800/30 py-2 px-3 text-[9px] font-black text-slate-500 uppercase border-b border-slate-700/50 shrink-0">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-3 text-center">White</span>
            <span className="col-span-3 text-center">Black</span>
          </div>
          <div className="flex-1 overflow-y-auto modern-scroll flex flex-col">
            {moveHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 opacity-20">
                <span className="font-bold uppercase text-[10px] tracking-widest text-white">No Moves Yet</span>
              </div>
            ) : (
              <div className="flex flex-col-reverse divide-y divide-y-reverse divide-slate-800/50">
                {renderMoveHistory()}
              </div>
            )}
          </div>
          <div className="bg-slate-800/60 p-2 border-t border-slate-700/50 mt-auto shrink-0">
            <div className="flex justify-between items-center px-2">
                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Status: {gameStatus}</span>
                <span className="text-[9px] text-emerald-400 font-black tabular-nums">TOTAL MOVES: {moveHistory.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
