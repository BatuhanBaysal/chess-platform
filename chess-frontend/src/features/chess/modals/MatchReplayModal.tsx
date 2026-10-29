import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Play, 
  Pause, 
  Download, 
  FileText, 
  Loader2,
  RotateCcw,
  Eye,
  Bot,
  User
} from 'lucide-react';
import { getGamePgn } from '../../../api/gameService';

interface MatchReplayModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly gameId: number | string | null;
  readonly opponentName?: string;
  readonly result?: string;
  readonly playerColor?: 'white' | 'black';
}

const INITIAL_BOARD: readonly string[][] = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const PIECE_IMAGES: Record<string, string> = {
  P: '/assets/pieces/wP.svg',
  N: '/assets/pieces/wN.svg',
  B: '/assets/pieces/wB.svg',
  R: '/assets/pieces/wR.svg',
  Q: '/assets/pieces/wQ.svg',
  K: '/assets/pieces/wK.svg',
  p: '/assets/pieces/bP.svg',
  n: '/assets/pieces/bN.svg',
  b: '/assets/pieces/bB.svg',
  r: '/assets/pieces/bR.svg',
  q: '/assets/pieces/bQ.svg',
  k: '/assets/pieces/bK.svg'
};

const MOVE_REGEX = /([a-h][1-8])(?:->|→|x)([a-h][1-8])/;
const PROMO_REGEX = /=([QRBNqrbn])/;
const WHITE_HEADER_REGEX = /\[White\s+"([^"]+)"\]/i;

const parseSquare = (sq: string): [number, number] | null => {
  if (!sq || sq.length < 2) return null;
  const col = (sq.codePointAt(0) ?? 0) - ('a'.codePointAt(0) ?? 0);
  const rank = Number.parseInt(sq.charAt(1), 10);
  if (col < 0 || col > 7 || rank < 1 || rank > 8) return null;
  const row = 8 - rank;
  return [row, col];
};

const getResultBadgeClass = (result?: string): string => {
  const lower = (result || '').toLowerCase();
  if (lower.includes('victory') || lower.includes('win')) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
  }
  if (lower.includes('draw')) {
    return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700';
  }
  return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
};

const applyCastleMove = (board: string[][], move: string, isWhiteMove: boolean): void => {
  const row = isWhiteMove ? 7 : 0;
  if (move === 'O-O' || move === '0-0') {
    board[row][4] = '';
    board[row][6] = isWhiteMove ? 'K' : 'k';
    board[row][7] = '';
    board[row][5] = isWhiteMove ? 'R' : 'r';
  } else if (move === 'O-O-O' || move === '0-0-0') {
    board[row][4] = '';
    board[row][2] = isWhiteMove ? 'K' : 'k';
    board[row][0] = '';
    board[row][3] = isWhiteMove ? 'R' : 'r';
  }
};

const handleKingCastlingRook = (
  board: string[][],
  fRow: number,
  fCol: number,
  tCol: number,
  piece: string,
  isWhiteMove: boolean
): void => {
  if ((piece !== 'K' && piece !== 'k') || Math.abs(fCol - tCol) !== 2) return;

  if (tCol === 6) {
    board[fRow][7] = '';
    board[fRow][5] = isWhiteMove ? 'R' : 'r';
  } else if (tCol === 2) {
    board[fRow][0] = '';
    board[fRow][3] = isWhiteMove ? 'R' : 'r';
  }
};

const handlePawnPromotion = (
  board: string[][],
  tRow: number,
  tCol: number,
  piece: string,
  move: string,
  isWhiteMove: boolean
): void => {
  const promoMatch = PROMO_REGEX.exec(move);
  if (promoMatch && piece) {
    const promoType = promoMatch[1].toUpperCase();
    board[tRow][tCol] = isWhiteMove ? promoType : promoType.toLowerCase();
  } else if ((piece === 'P' && tRow === 0) || (piece === 'p' && tRow === 7)) {
    board[tRow][tCol] = isWhiteMove ? 'Q' : 'q';
  }
};

const applyStandardMove = (board: string[][], move: string, isWhiteMove: boolean): void => {
  const moveMatch = MOVE_REGEX.exec(move);
  if (!moveMatch) return;

  const fromCoords = parseSquare(moveMatch[1]);
  const toCoords = parseSquare(moveMatch[2]);
  if (!fromCoords || !toCoords) return;

  const [fRow, fCol] = fromCoords;
  const [tRow, tCol] = toCoords;
  const piece = board[fRow][fCol];

  handleKingCastlingRook(board, fRow, fCol, tCol, piece, isWhiteMove);

  if ((piece === 'P' || piece === 'p') && fCol !== tCol && board[tRow][tCol] === '') {
    board[fRow][tCol] = '';
  }

  board[fRow][fCol] = '';
  board[tRow][tCol] = piece;

  handlePawnPromotion(board, tRow, tCol, piece, move, isWhiteMove);
};

const stripPgnMetadata = (raw: string): string => {
  let result = '';
  let insideBracket = false;
  let insideBrace = false;

  for (const ch of raw) {
    if (ch === '[') {
      insideBracket = true;
    } else if (ch === ']') {
      insideBracket = false;
    } else if (ch === '{') {
      insideBrace = true;
    } else if (ch === '}') {
      insideBrace = false;
    } else if (!insideBracket && !insideBrace) {
      result += ch;
    }
  }

  return result.trim();
};

export const MatchReplayModal = ({
  isOpen,
  onClose,
  gameId,
  opponentName = 'Opponent',
  result,
  playerColor: explicitColor
}: Readonly<MatchReplayModalProps>) => {
  const [pgnRaw, setPgnRaw] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [flipBoard, setFlipBoard] = useState<boolean>(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !gameId) {
      setPgnRaw('');
      setCurrentStep(0);
      setIsPlaying(false);
      return;
    }

    setLoading(true);
    setError(null);
    getGamePgn(gameId)
      .then((data) => {
        setPgnRaw(data);
        setCurrentStep(0);
      })
      .catch((err: unknown) => {
        console.error('Failed to load PGN:', err);
        setError('PGN record could not be retrieved.');
      })
      .finally(() => setLoading(false));
  }, [isOpen, gameId]);

  const userColor = useMemo<'white' | 'black'>(() => {
    if (explicitColor) return explicitColor;
    if (!pgnRaw) return 'white';

    const whiteMatch = WHITE_HEADER_REGEX.exec(pgnRaw);
    const whiteStr = (whiteMatch ? whiteMatch[1] : '').toLowerCase();

    if (whiteStr === '-1' || whiteStr.includes('stockfish') || whiteStr.includes('bot') || opponentName.toLowerCase().includes('stockfish')) {
      return 'black';
    }
    return 'white';
  }, [explicitColor, pgnRaw, opponentName]);

  useEffect(() => {
    setFlipBoard(userColor === 'black');
  }, [userColor]);

  const moves = useMemo(() => {
    if (!pgnRaw) return [];
    const cleanMovesText = stripPgnMetadata(pgnRaw);
    if (!cleanMovesText) return [];

    const tokens = cleanMovesText.split(/\s+/);
    const parsed: string[] = [];

    for (const token of tokens) {
      if (!token || /^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)) continue;
      const sanitized = token.replace(/^\d+\.+/, '').trim();
      if (sanitized) {
        parsed.push(sanitized);
      }
    }
    return parsed;
  }, [pgnRaw]);

  const boardStates = useMemo(() => {
    const states: string[][][] = [INITIAL_BOARD.map(row => [...row])];
    let currentBoard = INITIAL_BOARD.map(row => [...row]);

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const nextBoard = currentBoard.map(row => [...row]);
      const isWhiteMove = i % 2 === 0;

      if (move === 'O-O' || move === '0-0' || move === 'O-O-O' || move === '0-0-0') {
        applyCastleMove(nextBoard, move, isWhiteMove);
      } else {
        applyStandardMove(nextBoard, move, isWhiteMove);
      }

      states.push(nextBoard);
      currentBoard = nextBoard;
    }

    return states;
  }, [moves]);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= moves.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 850);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, moves.length]);

  if (!isOpen) return null;

  const rawBoard = boardStates[currentStep] || boardStates[0] || INITIAL_BOARD;

  const displayBoard = flipBoard
    ? [...rawBoard].reverse().map(row => [...row].reverse())
    : rawBoard;

  const handleDownload = () => {
    const blob = new Blob([pgnRaw], { type: 'application/x-chess-pgn;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${gameId}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isWhiteUser = userColor === 'white';
  const isOpponentBot = opponentName.toLowerCase().includes('stockfish') || opponentName.toLowerCase().includes('ai');

  const renderPlayerBadge = (isWhiteColumn: boolean) => {
    const isCurrentUser = isWhiteColumn ? isWhiteUser : !isWhiteUser;
    if (isCurrentUser) {
      const bgClass = isWhiteColumn ? 'bg-blue-600' : 'bg-rose-600';
      return (
        <span className={`text-[9px] px-1.5 py-0.5 rounded ${bgClass} text-white font-black leading-none shrink-0 shadow-xs`}>
          YOU
        </span>
      );
    }
    if (isOpponentBot) {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0 font-black">
          AI
        </span>
      );
    }
    return null;
  };

  const renderMoveList = () => {
    if (moves.length === 0) {
      return (
        <div className="text-center py-16 text-slate-400 uppercase text-[11px] font-bold">
          No moves recorded in PGN
        </div>
      );
    }

    const rowCount = Math.ceil(moves.length / 2);
    return Array.from({ length: rowCount }).map((_, index) => {
      const whiteMove = moves[index * 2];
      const blackMove = moves[index * 2 + 1];
      const isWhiteActive = currentStep === index * 2 + 1;
      const isBlackActive = currentStep === index * 2 + 2;

      const whiteBtnClass = isWhiteActive 
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' 
        : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40';

      const blackBtnClass = isBlackActive 
        ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30' 
        : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40';

      return (
        <div key={`move-row-${index}-${whiteMove || ''}`} className="flex items-center py-1 px-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50">
          <span className="w-8 text-slate-400 font-bold">{index + 1}.</span>
          
          <button
            type="button"
            onClick={() => setCurrentStep(index * 2 + 1)}
            className={`flex-1 px-2 py-0.5 rounded cursor-pointer font-bold transition-all truncate text-left border-0 bg-transparent ${whiteBtnClass}`}
          >
            {whiteMove || ''}
          </button>

          <button
            type="button"
            onClick={() => {
              if (blackMove) setCurrentStep(index * 2 + 2);
            }}
            disabled={!blackMove}
            className={`flex-1 px-2 py-0.5 rounded font-bold transition-all truncate text-left border-0 bg-transparent ${
              blackMove ? `cursor-pointer ${blackBtnClass}` : 'opacity-0 cursor-default'
            }`}
          >
            {blackMove || ''}
          </button>
        </div>
      );
    });
  };

  const renderModalBody = () => {
    if (loading) {
      return (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Match PGN...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-20 text-center text-rose-500 text-xs font-bold uppercase">
          {error}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Chess Board & Controls */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-85 sm:max-w-105 aspect-square rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-md grid grid-cols-8 grid-rows-8">
            {displayBoard.map((row, rIdx) =>
              row.map((piece, cIdx) => {
                const isDarkSq = (rIdx + cIdx) % 2 === 1;

                return (
                  <div
                    key={`square-${rIdx}-${cIdx}`}
                    className={`flex items-center justify-center select-none p-1 transition-colors ${
                      isDarkSq
                        ? 'bg-[#b58863] dark:bg-[#3d4b68]'
                        : 'bg-[#f0d9b5] dark:bg-[#97a5c4]'
                    }`}
                  >
                    {piece && PIECE_IMAGES[piece] && (
                      <img 
                        src={PIECE_IMAGES[piece]} 
                        alt={piece}
                        className="w-full h-full object-contain pointer-events-none drop-shadow-md transition-transform duration-150"
                        draggable={false}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              disabled={currentStep === 0}
              className="p-2 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              title="First Move"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="p-2 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              title="Previous Move"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={moves.length === 0}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(moves.length, prev + 1))}
              disabled={currentStep >= moves.length}
              className="p-2 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              title="Next Move"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(moves.length)}
              disabled={currentStep >= moves.length}
              className="p-2 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              title="Last Move"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>

        {/* Move Notation Sheet */}
        <div className="md:col-span-5 h-85 sm:h-105 flex flex-col bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span>Moves Notation</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">{currentStep} / {moves.length}</span>
          </div>

          <div className="flex items-center px-2 py-1.5 mb-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-[11px] font-black uppercase tracking-wider text-slate-500">
            <span className="w-8 text-slate-400">#</span>
            
            {/* White Column */}
            <div className="flex-1 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold min-w-0 pr-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="truncate">White</span>
              {renderPlayerBadge(true)}
            </div>

            {/* Black Column */}
            <div className="flex-1 flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-extrabold min-w-0 pl-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="truncate">Black</span>
              {renderPlayerBadge(false)}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs pr-1">
            {renderMoveList()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className="relative z-10 w-full max-w-5xl bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileText size={20} />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white">
                  Match #{gameId}
                </h3>

                {result && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getResultBadgeClass(result)}`}>
                    {result}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                <div className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400">
                  {isOpponentBot ? <Bot size={13} className="text-purple-500" /> : <User size={13} className="text-indigo-500" />}
                  <span className="truncate max-w-30 sm:max-w-50">{opponentName}</span>
                </div>

                <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>

                <div className="flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
                  <Eye size={12} className="opacity-70" />
                  <span>Perspective:</span>
                  <span className={`font-black uppercase text-[11px] ${flipBoard ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {flipBoard ? 'Black' : 'White'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <button
              type="button"
              onClick={() => setFlipBoard(!flipBoard)}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Flip Board View"
            >
              <RotateCcw size={18} />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!pgnRaw}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors disabled:opacity-40 cursor-pointer"
              title="Download PGN"
            >
              <Download size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer ml-1"
              title="Close Replay"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {renderModalBody()}
        </div>
      </div>
    </div>
  );
};

export default MatchReplayModal;
