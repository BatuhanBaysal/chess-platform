import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'; 
import { CSS } from '@dnd-kit/utilities';
import { Trophy, ArrowLeft } from 'lucide-react';

interface ChessBoardProps {
  boardRepresentation: string;
  gameStatus: string;
  currentTurn: string;
  moveHistory: string[];
  lastMoveMessage: string;
  onMove: (fromFile: number, fromRank: number, toFile: number, toRank: number, promotion?: string) => void;
  fetchLegalMoves?: (file: number, rank: number) => Promise<{ file: number, rank: number }[]>;
  onNewGame?: () => void;
  onBackToMenu?: () => void;
  theme: 'classic' | 'modern' | 'emerald';
  timeLimit: number;
  orientation: 'WHITE' | 'BLACK';
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

const BOARD_THEMES = {
  classic: { dark: 'bg-[#b58863]', light: 'bg-[#f0d9b5]', textDark: 'text-[#b58863]', textLight: 'text-[#f0d9b5]' },
  modern: { dark: 'bg-[#4b7399]', light: 'bg-[#eae9d2]', textDark: 'text-[#4b7399]', textLight: 'text-[#eae9d2]' },
  emerald: { dark: 'bg-[#6a8d5c]', light: 'bg-[#eceed1]', textDark: 'text-[#6a8d5c]', textLight: 'text-[#eceed1]' }
};

const INITIAL_PIECES = {
  white: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'N', 'N', 'B', 'B', 'R', 'R', 'Q', 'K'],
  black: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q', 'k']
};

const SCROLLBAR_STYLE = `
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 10px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
`;

const DraggablePiece: React.FC<{ char: string; index: number; isSelected: boolean }> = ({ char, index, isSelected }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `piece-${index}`,
    data: { fromIndex: index, char }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : 10,
    opacity: isDragging ? 0 : 1, 
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`w-[95%] h-[95%] flex items-center justify-center transition-transform cursor-grab active:cursor-grabbing ${isSelected ? 'scale-110' : ''}`}
    >
      <img src={PIECE_IMAGES[char]} alt={char} className="w-full h-full pointer-events-none drop-shadow-md" />
    </div>
  );
};

const DroppableSquare: React.FC<{ index: number; children: React.ReactNode; className: string; onClick: () => void }> = ({ index, children, className, onClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `square-${index}`,
  });

  return (
    <div ref={setNodeRef} onClick={onClick} className={`${className} ${isOver ? 'brightness-125' : ''}`}>
      {children}
    </div>
  );
};

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  boardRepresentation, 
  gameStatus, 
  currentTurn, 
  moveHistory,
  lastMoveMessage,
  onMove, 
  fetchLegalMoves, 
  onBackToMenu,
  theme,
  timeLimit,
  orientation
}) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: number, to: number } | null>(null);
  const [legalMoves, setLegalMoves] = useState<{ file: number, rank: number }[]>([]);
  const [logs, setLogs] = useState<{text: string, turn: string, time: string}[]>([]);
  const [activePiece, setActivePiece] = useState<{char: string, index: number} | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [activeTheme, setActiveTheme] = useState(theme);
  
  const [whiteTime, setWhiteTime] = useState(timeLimit * 60);
  const [blackTime, setBlackTime] = useState(timeLimit * 60);

  const lastProcessedMessage = useRef<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('chess_preferred_theme');
    if (savedTheme && (savedTheme === 'classic' || savedTheme === 'modern' || savedTheme === 'emerald')) {
      setActiveTheme(savedTheme as any);
    } else {
      setActiveTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('chess_preferred_theme', activeTheme);
  }, [activeTheme]);

  const currentTheme = BOARD_THEMES[activeTheme] || BOARD_THEMES.classic;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const boardData = boardRepresentation.split('|');
  const squares = boardData[0] ? boardData[0].slice(0, 64).split('') : Array(64).fill('.');
  const upperStatus = gameStatus.toUpperCase();

  useEffect(() => {
    if (moveHistory.length > 0 && logs.length === 0) {
      const initialLogs = moveHistory.map((move, idx) => ({
        text: `Move: ${move}`,
        turn: idx % 2 === 0 ? 'WHITE' : 'BLACK',
        time: '--:--'
      })).reverse();
      setLogs(initialLogs);
    }
  }, [moveHistory]);

  useEffect(() => {
    const isNowGameOver = ['CHECKMATE', 'STALEMATE', 'DRAW', 'RESIGNED', 'TIMEOUT'].includes(upperStatus);
    
    if (isNowGameOver) {
      const timer = setTimeout(() => {
        setShowGameOverModal(true);
        setSelectedSquare(null);
        setLegalMoves([]);
      }, 150); 
      return () => clearTimeout(timer);
    } else {
      setShowGameOverModal(false);
    }
  }, [upperStatus]);

  useEffect(() => {
    if (upperStatus === 'ACTIVE' || upperStatus === 'CHECK' || upperStatus === 'WAITING') {
      if (moveHistory.length === 0) {
        setWhiteTime(timeLimit * 60);
        setBlackTime(timeLimit * 60);
      }
    }
  }, [moveHistory.length, timeLimit, upperStatus]);

  const getVisualIndex = (index: number) => {
    if (orientation === 'BLACK') return 63 - index;
    return index;
  };

  useEffect(() => {
    let interval: any;
    const isGameOver = ['CHECKMATE', 'STALEMATE', 'DRAW', 'RESIGNED', 'TIMEOUT'].includes(upperStatus);
    if (!isGameOver && upperStatus !== 'WAITING') {
      interval = setInterval(() => {
        if (currentTurn.toUpperCase() === 'WHITE') {
          setWhiteTime(prev => Math.max(0, prev - 1));
        } else {
          setBlackTime(prev => Math.max(0, prev - 1));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTurn, upperStatus]);

  useEffect(() => {
    if (lastMoveMessage && lastMoveMessage !== lastProcessedMessage.current) {
      const isError = lastMoveMessage.includes("Illegal") || lastMoveMessage.includes("not your turn");
      const isStart = lastMoveMessage.includes("Game started");
      
      let moveColor = isStart ? "" : (currentTurn.toUpperCase() === 'WHITE' ? 'BLACK' : 'WHITE');
      if (isError) moveColor = currentTurn.toUpperCase();

      const newLog = {
        text: lastMoveMessage,
        turn: moveColor,
        time: new Date().toLocaleTimeString([], { hour12: false })
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50));
      lastProcessedMessage.current = lastMoveMessage;
      
      if (!isError) {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
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

    const whiteScore = tempBlack.reduce((acc, p) => acc + PIECE_VALUES[p.toUpperCase()], 0);
    const blackScore = tempWhite.reduce((acc, p) => acc + PIECE_VALUES[p.toUpperCase()], 0);

    return {
      whiteCaptured: tempBlack.sort((a, b) => PIECE_VALUES[a.toUpperCase()] - PIECE_VALUES[b.toUpperCase()]),
      blackCaptured: tempWhite.sort((a, b) => PIECE_VALUES[a.toUpperCase()] - PIECE_VALUES[b.toUpperCase()]),
      advantage: whiteScore - blackScore
    };
  }, [squares]);

  const { whiteCaptured, blackCaptured, advantage } = getCapturedPieces();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSquareClick = async (index: number) => {
    const isGameOver = ['CHECKMATE', 'STALEMATE', 'DRAW', 'RESIGNED', 'TIMEOUT'].includes(upperStatus);
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
    } else {
      if (selectedSquare === index) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const isLegal = legalMoves.some(m => m.file === file && m.rank === rank);
      if (isLegal) {
        executeMove(selectedSquare, index);
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
    }
  };

  const executeMove = (fromIndex: number, toIndex: number) => {
    const fromFile = fromIndex % 8;
    const fromRank = 7 - Math.floor(fromIndex / 8);
    const toFile = toIndex % 8;
    const toRank = 7 - Math.floor(toIndex / 8);
    const movingPiece = squares[fromIndex];
    const isPawn = movingPiece.toLowerCase() === 'p';
    const isPromotion = isPawn && (toRank === 7 || toRank === 0);

    if (isPromotion) {
      setPromotionPending({ from: fromIndex, to: toIndex });
    } else {
      onMove(fromFile, fromRank, toFile, toRank);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const isGameOver = ['CHECKMATE', 'STALEMATE', 'DRAW', 'RESIGNED', 'TIMEOUT'].includes(upperStatus);
    if (isGameOver) return;
    const { active } = event;
    const visualIndex = parseInt((active.id as string).split('-')[1]);
    const index = getVisualIndex(visualIndex);
    const char = active.data.current?.char;
    setActivePiece({ char, index });
    handleSquareClick(index); 
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const isGameOver = ['CHECKMATE', 'STALEMATE', 'DRAW', 'RESIGNED', 'TIMEOUT'].includes(upperStatus);
    const { active, over } = event;
    setActivePiece(null);
    if (!over || isGameOver) return;
    
    const visualFromIndex = parseInt((active.id as string).split('-')[1]);
    const fromIndex = getVisualIndex(visualFromIndex);
    const visualToIndex = parseInt((over.id as string).split('-')[1]);
    const toIndex = getVisualIndex(visualToIndex);

    if (fromIndex !== undefined && fromIndex !== toIndex) {
      const file = toIndex % 8;
      const rank = 7 - Math.floor(toIndex / 8);
      const isLegal = legalMoves.some(m => m.file === file && m.rank === rank);
      if (isLegal) executeMove(fromIndex, toIndex);
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

  const renderNotation = () => {
    const pairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({
        index: Math.floor(i / 2) + 1,
        white: moveHistory[i],
        black: moveHistory[i + 1] || "..."
      });
    }
    return [...pairs].reverse();
  };

  return (
    <div className="flex flex-col xl:flex-row items-stretch justify-center gap-6 p-8 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-[1550px] transition-all relative">
      <style>{SCROLLBAR_STYLE}</style>
      
      {showGameOverModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mb-6 border border-yellow-500/20">
              <Trophy size={40} className="text-yellow-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">MISSION COMPLETE</h2>
            <div className="px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20 mb-8">
               <p className="text-blue-500 text-xs font-black uppercase tracking-widest">{upperStatus}: {currentTurn.toUpperCase() === 'WHITE' ? 'BLACK' : 'WHITE'} VICTORIOUS</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 w-full min-w-[240px]">
              <button 
                onClick={() => {
                  setShowGameOverModal(false);
                  if (onBackToMenu) onBackToMenu();
                  else window.location.href = '/';
                }} 
                className="group flex items-center justify-center gap-3 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {promotionPending && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center gap-6">
            <h3 className="text-blue-500 font-black uppercase text-xs tracking-widest px-4 py-1.5 rounded-full border border-blue-500/30">Promotion</h3>
            <div className="grid grid-cols-2 gap-4">
              {['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'].map((type) => {
                const pieceKey = type === 'KNIGHT' ? 'N' : type[0];
                const finalKey = currentTurn.toUpperCase() === 'WHITE' ? pieceKey : pieceKey.toLowerCase();
                return (
                  <button key={type} onClick={() => completePromotion(type)} className="flex flex-col items-center p-6 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-blue-600/20 transition-all group">
                    <img src={PIECE_IMAGES[finalKey]} className="w-16 h-16 group-hover:scale-110 transition-transform" alt={type} />
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-2 group-hover:text-blue-500">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="w-full xl:w-32 bg-slate-900/40 border border-slate-700/50 rounded-xl flex xl:flex-col justify-between p-3 py-4 backdrop-blur-sm h-auto xl:h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <div className="text-[14px] font-black font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded border border-slate-700">{formatTime(blackTime)}</div>
          <div className="grid grid-cols-4 xl:grid-cols-2 gap-1 max-h-[180px] overflow-y-auto custom-scroll">
            {blackCaptured.map((p, i) => (<img key={i} src={PIECE_IMAGES[p]} className="w-6 h-6 grayscale hover:grayscale-0" alt="cap" />))}
          </div>
          {advantage < 0 && <span className="text-[10px] font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">+{Math.abs(advantage)}</span>}
        </div>
        <div className="hidden xl:block h-px bg-slate-700/30 w-full" />
        <div className="flex flex-col items-center gap-2">
          {advantage > 0 && <span className="text-[10px] font-black bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">+{advantage}</span>}
          <div className="grid grid-cols-4 xl:grid-cols-2 gap-1 max-h-[180px] overflow-y-auto custom-scroll">
            {whiteCaptured.map((p, i) => (<img key={i} src={PIECE_IMAGES[p]} className="w-6 h-6 grayscale hover:grayscale-0" alt="cap" />))}
          </div>
          <div className="text-[14px] font-black font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/30">{formatTime(whiteTime)}</div>
        </div>
      </div>

      <div className="relative">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-8 grid-rows-8 border-[12px] border-slate-900 bg-slate-900 rounded-lg shadow-2xl" style={{ width: '600px', height: '600px' }}>
            {Array.from({ length: 64 }).map((_, visualIndex) => {
              const actualIndex = getVisualIndex(visualIndex);
              const char = squares[actualIndex];
              const row = Math.floor(actualIndex / 8);
              const col = actualIndex % 8;
              const currentRank = 7 - row;
              
              const isDark = (row + col) % 2 === 1;
              const isSelected = selectedSquare === actualIndex;
              const isLegalTarget = legalMoves.some(m => m.file === col && m.rank === currentRank);
              const isKingInDanger = (upperStatus === 'CHECK' || upperStatus === 'CHECKMATE') && 
                                     ((currentTurn.toUpperCase() === 'WHITE' && char === 'K') || 
                                      (currentTurn.toUpperCase() === 'BLACK' && char === 'k'));

              const squareClass = `relative flex items-center justify-center aspect-square transition-all
                ${isDark ? currentTheme.dark : currentTheme.light} 
                ${isSelected ? 'bg-blue-500/50 shadow-[inset_0_0_0_4px_#3b82f6] z-10' : ''} 
                ${isKingInDanger ? 'bg-red-600/90 animate-pulse z-20' : ''}`;

              return (
                <DroppableSquare key={visualIndex} index={visualIndex} onClick={() => handleSquareClick(actualIndex)} className={squareClass}>
                  {col === 0 && <span className={`absolute left-1 top-0.5 text-[10px] font-bold ${isDark ? currentTheme.textLight : currentTheme.textDark}`}>{currentRank + 1}</span>}
                  {row === 7 && <span className={`absolute right-1 bottom-0.5 text-[10px] font-bold ${isDark ? currentTheme.textLight : currentTheme.textDark}`}>{String.fromCharCode(97 + col)}</span>}
                  
                  {isLegalTarget && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      {char === '.' ? <div className="w-4 h-4 bg-black/15 rounded-full" /> : <div className="w-full h-full border-[6px] border-black/10 rounded-full" />}
                    </div>
                  )}

                  {char !== '.' && (
                    <DraggablePiece char={char} index={visualIndex} isSelected={isSelected} />
                  )}
                </DroppableSquare>
              );
            })}
          </div>
          
          <DragOverlay dropAnimation={null}>
            {activePiece ? (
              <div className="w-[70px] h-[70px] flex items-center justify-center cursor-grabbing">
                <img src={PIECE_IMAGES[activePiece.char]} alt="dragging" className="w-[90%] h-[90%] drop-shadow-2xl" />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="flex flex-row gap-4 h-[600px] w-full xl:w-[500px]">
        
        <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl flex flex-col overflow-hidden backdrop-blur-md">
          <div className="bg-slate-800 p-3 border-b border-slate-700 text-center">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white italic">Live Telemetry</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
            {logs.length === 0 && (
              <div className="flex items-center justify-center h-full text-[9px] font-black uppercase tracking-widest text-slate-600">Waiting for data...</div>
            )}
            {logs.map((log, i) => (
              <div key={i} className={`text-[11px] p-3 rounded-lg border-l-2 ${log.text.includes("Illegal") ? "bg-rose-500/10 border-rose-500 text-rose-200" : "bg-slate-800/40 border-blue-500 text-slate-300"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="opacity-40 font-mono text-[9px]">{log.time}</span>
                  {log.turn && <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${log.turn === 'WHITE' ? 'bg-white text-black' : 'bg-slate-700 text-white'}`}>{log.turn}</span>}
                </div>
                <span className="font-semibold">{log.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-[180px] bg-slate-900/50 border border-slate-700/50 rounded-xl flex flex-col overflow-hidden backdrop-blur-md">
          <div className="bg-slate-800 p-3 border-b border-slate-700">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white italic">Notation</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scroll">
            {renderNotation().map((pair) => (
              <div key={pair.index} className="grid grid-cols-3 text-[11px] py-2 border-b border-slate-800/50 text-slate-400 font-mono items-center">
                <span className="font-bold text-blue-500/50 text-center">{pair.index}.</span>
                <span className="text-slate-200">{pair.white}</span>
                <span className="text-slate-400">{pair.black}</span>
              </div>
            ))}
            {moveHistory.length === 0 && (
              <div className="text-[9px] text-center mt-10 text-slate-600 font-black uppercase tracking-tighter">No moves yet</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChessBoard;
