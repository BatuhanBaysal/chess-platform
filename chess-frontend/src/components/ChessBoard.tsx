import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'; 
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'; 
import { CSS } from '@dnd-kit/utilities';
import { Trophy, ArrowLeft, Loader2 } from 'lucide-react';

interface ChessBoardProps {
  boardRepresentation: string;
  isStarted: boolean;
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

const DraggablePiece: React.FC<{ char: string; index: number; isSelected: boolean; disabled: boolean }> = ({ char, index, isSelected, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `piece-${index}`,
    data: { index, char },
    disabled: disabled
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : 10,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : listeners)}
      {...(disabled ? {} : attributes)}
      className={`w-full h-full flex items-center justify-center transition-transform ${disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${isSelected ? 'scale-110' : ''}`}
    >
      <img src={PIECE_IMAGES[char]} alt={char} className="w-[85%] h-[85%] pointer-events-none drop-shadow-md" />
    </div>
  );
};

const DroppableSquare: React.FC<{ index: number; children: React.ReactNode; className: string; onClick: () => void }> = ({ index, children, className, onClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `square-${index}` });
  return (
    <div ref={setNodeRef} onClick={onClick} className={`${className} ${isOver ? 'brightness-110 contrast-125' : ''}`}>
      {children}
    </div>
  );
};

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  boardRepresentation, isStarted, gameStatus, currentTurn, moveHistory, lastMoveMessage,
  onMove, fetchLegalMoves, onBackToMenu, theme, timeLimit, orientation
}) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: number, to: number } | null>(null);
  const [legalMoves, setLegalMoves] = useState<{ file: number, rank: number }[]>([]);
  const [logs, setLogs] = useState<{text: string, turn: string, time: string}[]>([]);
  const [activePiece, setActivePiece] = useState<{char: string, index: number} | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [whiteTime, setWhiteTime] = useState(timeLimit * 60);
  const [blackTime, setBlackTime] = useState(timeLimit * 60);

  const lastProcessedMessage = useRef<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const squares = useMemo(() => {
    if (!boardRepresentation) return Array(64).fill('.');
    return boardRepresentation.split('|')[0].slice(0, 64).split('');
  }, [boardRepresentation]);

  const upperStatus = (gameStatus || "").toUpperCase();
  const isGameOver = ['WON', 'LOST', 'DRAW', 'CHECKMATE', 'STALEMATE', 'RESIGNED', 'TIMEOUT'].some(s => upperStatus.includes(s));
  const isCheck = upperStatus.includes('CHECK') && !isGameOver;
  const isMyTurn = currentTurn?.toUpperCase() === orientation.toUpperCase();
  const currentTheme = BOARD_THEMES[theme] || BOARD_THEMES.classic;

  const getActualIndex = (visualIndex: number) => {
    return orientation === 'WHITE' ? visualIndex : 63 - visualIndex;
  };

  const getCoordsFromIndex = (index: number) => {
    const file = index % 8;
    const rank = 7 - Math.floor(index / 8);
    return { file, rank };
  };

  useEffect(() => {
    if (isGameOver) {
      const timer = setTimeout(() => setShowGameOverModal(true), 600);
      return () => clearTimeout(timer);
    } else {
      setShowGameOverModal(false);
    }
  }, [isGameOver]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isGameOver && isStarted) {
      interval = setInterval(() => {
        if (currentTurn.toUpperCase() === 'WHITE') setWhiteTime(prev => Math.max(0, prev - 1));
        else setBlackTime(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTurn, isStarted, isGameOver]);

  useEffect(() => {
    if (lastMoveMessage && lastMoveMessage !== lastProcessedMessage.current) {
      const isError = lastMoveMessage.includes("Illegal") || lastMoveMessage.includes("not your turn");
      setLogs(prev => [{
        text: lastMoveMessage,
        turn: isError ? currentTurn.toUpperCase() : (currentTurn.toUpperCase() === 'WHITE' ? 'BLACK' : 'WHITE'),
        time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })
      }, ...prev].slice(0, 50));
      
      lastProcessedMessage.current = lastMoveMessage;
      
      if (!isError) {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  }, [lastMoveMessage, currentTurn]);

  const { whiteCaptured, blackCaptured } = useMemo(() => {
    const currentWhite = squares.filter(s => s !== '.' && s === s.toUpperCase());
    const currentBlack = squares.filter(s => s !== '.' && s === s.toLowerCase());
    let tempWhite = [...INITIAL_PIECES.white], tempBlack = [...INITIAL_PIECES.black];
    currentWhite.forEach(p => { const idx = tempWhite.indexOf(p); if (idx > -1) tempWhite.splice(idx, 1); });
    currentBlack.forEach(p => { const idx = tempBlack.indexOf(p); if (idx > -1) tempBlack.splice(idx, 1); });
    return {
      whiteCaptured: tempBlack.sort((a, b) => PIECE_VALUES[a.toUpperCase()] - PIECE_VALUES[b.toUpperCase()]),
      blackCaptured: tempWhite.sort((a, b) => PIECE_VALUES[a.toUpperCase()] - PIECE_VALUES[b.toUpperCase()])
    };
  }, [squares]);

  const executeMove = (fromIndex: number, toIndex: number) => {
    if (isGameOver) return;
    const from = getCoordsFromIndex(fromIndex);
    const to = getCoordsFromIndex(toIndex);
    const movingPiece = squares[fromIndex];
    const isPawn = movingPiece.toLowerCase() === 'p';
    const isPromotion = isPawn && (to.rank === 7 || to.rank === 0);
    
    setSelectedSquare(null);
    setLegalMoves([]);
    
    if (isPromotion) {
      setPromotionPending({ from: fromIndex, to: toIndex });
    } else {
      onMove(from.file, from.rank, to.file, to.rank);
    }
  };

  const handleSquareClick = async (actualIndex: number) => {
    if (isGameOver || !isMyTurn || !isStarted) return;
    const { file, rank } = getCoordsFromIndex(actualIndex);
    const pieceAtTarget = squares[actualIndex];

    if (selectedSquare === null) {
      const isOwnPiece = (orientation === 'WHITE' && pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toUpperCase()) ||
                         (orientation === 'BLACK' && pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toLowerCase());
      if (isOwnPiece) {
        setSelectedSquare(actualIndex);
        if (fetchLegalMoves) {
          const moves = await fetchLegalMoves(file, rank);
          setLegalMoves(moves);
        }
      }
    } else {
      const isLegal = legalMoves.some(m => m.file === file && m.rank === rank);
      if (isLegal) {
        executeMove(selectedSquare, actualIndex);
      } else {
        const isOwnPiece = (orientation === 'WHITE' && pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toUpperCase()) ||
                           (orientation === 'BLACK' && pieceAtTarget !== '.' && pieceAtTarget === pieceAtTarget.toLowerCase());
        if (isOwnPiece) {
          setSelectedSquare(actualIndex);
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

  const handleDragStart = (event: DragStartEvent) => {
    if (isGameOver || !isMyTurn || !isStarted) return;
    const visualIndex = parseInt((event.active.id as string).split('-')[1]);
    const actualIndex = getActualIndex(visualIndex);
    setActivePiece({ char: event.active.data.current?.char, index: actualIndex });
    handleSquareClick(actualIndex); 
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePiece(null);
    const { active, over } = event;
    if (!over || isGameOver || !isMyTurn || !isStarted) return;
    
    const visualFrom = parseInt((active.id as string).split('-')[1]);
    const visualTo = parseInt((over.id as string).split('-')[1]);
    const fromIndex = getActualIndex(visualFrom);
    const toIndex = getActualIndex(visualTo);
    
    if (fromIndex !== toIndex) {
      const to = getCoordsFromIndex(toIndex);
      const isLegal = legalMoves.some(m => m.file === to.file && m.rank === to.rank);
      if (isLegal) executeMove(fromIndex, toIndex);
      else { setSelectedSquare(null); setLegalMoves([]); }
    }
  };

  return (
    <div className="flex flex-col xl:flex-row items-stretch justify-center gap-6 p-8 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-[1550px] transition-all relative">
      <style>{`.custom-scroll::-webkit-scrollbar { width: 5px; } .custom-scroll::-webkit-scrollbar-track { background: transparent; } .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }`}</style>

      <div className={`fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-xl transition-all duration-500 ${showGameOverModal ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center text-center transition-transform duration-500 ${showGameOverModal ? 'scale-100' : 'scale-90'}`}>
          <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-8 border border-yellow-500/20 ring-8 ring-yellow-500/5"><Trophy size={48} className="text-yellow-500 animate-bounce" /></div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter italic">{upperStatus || "GAME OVER"}</h2>
          <p className="text-slate-500 mb-8 font-medium">{lastMoveMessage}</p>
          <button onClick={onBackToMenu} className="group flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase text-[11px] tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"><ArrowLeft size={16} /> Exit to Menu</button>
        </div>
      </div>

      {!isStarted && !isGameOver && (
        <div className="absolute inset-0 z-[250] bg-slate-900/70 backdrop-blur-md rounded-2xl flex items-center justify-center">
          <div className="bg-slate-900 border border-blue-500/40 p-10 rounded-3xl flex items-center gap-6"><Loader2 className="text-blue-500 animate-spin" size={40} /><span className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-400">Syncing...</span></div>
        </div>
      )}

      {promotionPending && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-700 shadow-2xl flex gap-4">
            {['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'].map((type) => {
              const char = type === 'KNIGHT' ? 'N' : type[0];
              const iconKey = orientation === 'WHITE' ? char : char.toLowerCase();
              return (
                <button key={type} onClick={() => {
                  const from = getCoordsFromIndex(promotionPending!.from);
                  const to = getCoordsFromIndex(promotionPending!.to);
                  onMove(from.file, from.rank, to.file, to.rank, type);
                  setPromotionPending(null);
                }} className="flex flex-col items-center p-6 bg-slate-800/50 border border-slate-700 rounded-3xl hover:bg-blue-600/20 transition-all">
                  <img src={PIECE_IMAGES[iconKey]} className="w-16 h-16" alt={type} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={`w-full xl:w-28 bg-slate-900/40 border border-slate-700/50 rounded-2xl flex ${orientation === 'BLACK' ? 'flex-col-reverse' : 'flex-col'} justify-between p-4 h-auto xl:h-[600px]`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`text-sm font-black font-mono px-3 py-1.5 rounded-lg border ${isStarted && currentTurn?.toUpperCase() === 'BLACK' && !isGameOver ? 'text-rose-400 bg-rose-500/10 border-rose-500 animate-pulse' : 'text-slate-500 bg-slate-800'}`}>{Math.floor(blackTime / 60)}:{(blackTime % 60).toString().padStart(2, '0')}</div>
          <div className="grid grid-cols-4 xl:grid-cols-2 gap-1.5 opacity-60">{blackCaptured.map((p, i) => (<img key={i} src={PIECE_IMAGES[p]} className="w-5 h-5 grayscale" alt="cap" />))}</div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-4 xl:grid-cols-2 gap-1.5 opacity-60">{whiteCaptured.map((p, i) => (<img key={i} src={PIECE_IMAGES[p]} className="w-5 h-5 grayscale" alt="cap" />))}</div>
          <div className={`text-sm font-black font-mono px-3 py-1.5 rounded-lg border ${isStarted && currentTurn?.toUpperCase() === 'WHITE' && !isGameOver ? 'text-blue-400 bg-blue-500/10 border-blue-500 animate-pulse' : 'text-slate-500 bg-slate-800'}`}>{Math.floor(whiteTime / 60)}:{(whiteTime % 60).toString().padStart(2, '0')}</div>
        </div>
      </div>

      <div className="relative">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-8 grid-rows-8 border-[12px] border-slate-900 bg-slate-900 rounded-xl overflow-hidden shadow-2xl" style={{ width: '600px', height: '600px' }}>
            {Array.from({ length: 64 }).map((_, visualIndex) => {
              const actualIndex = getActualIndex(visualIndex);
              const char = squares[actualIndex];
              const { file: col, rank: displayRank } = getCoordsFromIndex(actualIndex);
              const isDark = (Math.floor(visualIndex / 8) + (visualIndex % 8)) % 2 === 1;
              const isSelected = selectedSquare === actualIndex;
              const isLegalTarget = legalMoves.some(m => m.file === col && m.rank === displayRank);
              const isKingInDanger = isCheck && ((currentTurn?.toUpperCase() === 'WHITE' && char === 'K') || (currentTurn?.toUpperCase() === 'BLACK' && char === 'k'));

              return (
                <DroppableSquare key={visualIndex} index={visualIndex} onClick={() => handleSquareClick(actualIndex)} className={`relative flex items-center justify-center aspect-square ${isDark ? currentTheme.dark : currentTheme.light} ${isSelected ? 'ring-4 ring-blue-500/50 z-30' : ''} ${isKingInDanger ? 'bg-red-600/90 animate-pulse' : ''}`}>
                  {col === (orientation === 'WHITE' ? 0 : 7) && <span className={`absolute left-1 top-0.5 text-[9px] font-black opacity-30 ${isDark ? currentTheme.textLight : currentTheme.textDark}`}>{displayRank + 1}</span>}
                  {displayRank === (orientation === 'WHITE' ? 0 : 7) && <span className={`absolute right-1 bottom-0.5 text-[9px] font-black opacity-30 ${isDark ? currentTheme.textLight : currentTheme.textDark}`}>{String.fromCharCode(97 + col)}</span>}
                  {isLegalTarget && <div className="absolute inset-0 flex items-center justify-center z-20"><div className="w-4 h-4 bg-black/10 rounded-full" /></div>}
                  {char !== '.' && (
                    <DraggablePiece 
                      char={char} index={visualIndex} isSelected={isSelected} 
                      disabled={!isStarted || !isMyTurn || isGameOver || ((orientation === 'WHITE' && char === char.toLowerCase()) || (orientation === 'BLACK' && char === char.toUpperCase()))} 
                    />
                  )}
                </DroppableSquare>
              );
            })}
          </div>
          <DragOverlay dropAnimation={{ duration: 150, sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
            {activePiece ? (
              <div className="w-[70px] h-[70px] flex items-center justify-center cursor-grabbing scale-110">
                <img src={PIECE_IMAGES[activePiece.char]} alt="dragging" className="w-full h-full drop-shadow-2xl" />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="flex flex-col gap-4 h-[600px] w-full xl:w-[420px]">
        <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
            {logs.map((log, i) => (
              <div key={i} className={`text-[11px] p-3 rounded-xl border-l-4 ${log.text.includes("Illegal") ? "bg-rose-500/5 border-rose-500" : "bg-slate-800/40 border-blue-500/50"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="opacity-40 text-[9px] font-mono">{log.time}</span>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-black ${log.turn === 'WHITE' ? 'bg-white text-black' : 'bg-slate-700 text-white'}`}>{log.turn}</span>
                </div>
                <span className="font-bold text-slate-300">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-[200px] bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden p-3 flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">History</span>
            <div className="flex-1 overflow-y-auto custom-scroll">
                {(moveHistory || []).slice().reverse().map((move, i) => (<div key={i} className="py-1 px-2 border-b border-slate-800/30 text-[11px] text-slate-400 font-mono">{move}</div>))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
