import React, { useState } from 'react';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Activity, ListOrdered } from 'lucide-react';
import { useChessGameLogic } from '../hooks/useChessGameLogic';
import { BoardGrid } from './BoardGrid';
import { MatchInfoPanel } from './MatchInfoPanel';
import { TelemetrySidebar } from './TelemetrySidebar';
import { NotationSidebar } from './NotationSidebar';
import { PromotionModal } from './PromotionModal';
import { GameOverModal } from './GameOverModal';
import type { ChessBoardProps } from '../types/chess.types';
import { CHESS_THEMES, type ChessThemeKey } from '../../../constants/chessThemes';

const PIECE_IMAGES: { [key: string]: string } = {
  'P': './assets/pieces/wP.svg',
  'N': './assets/pieces/wN.svg',
  'B': './assets/pieces/wB.svg',
  'R': './assets/pieces/wR.svg',
  'Q': './assets/pieces/wQ.svg',
  'K': './assets/pieces/wK.svg',
  'p': './assets/pieces/bP.svg',
  'n': './assets/pieces/bN.svg',
  'b': './assets/pieces/bB.svg',
  'r': './assets/pieces/bR.svg',
  'q': './assets/pieces/bQ.svg',
  'k': './assets/pieces/bK.svg'
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  boardRepresentation, isStarted, gameStatus, currentTurn, moveHistory,
  lastMoveMessage, onMove, fetchLegalMoves, onBackToMenu,
  onDismissGame, theme = 'modern', orientation = 'WHITE',
  whiteRemainingTimeMs, blackRemainingTimeMs, game,
  hintData = null, isHintLoading = false, onGetHint = () => {},
  evaluationScore = 0, evaluationType = 'CP',
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const currentTheme = CHESS_THEMES[theme as ChessThemeKey] || CHESS_THEMES.modern;
  const [activeTab, setActiveTab] = useState<'telemetry' | 'notation'>('telemetry');

  const {
    selectedSquare, promotionPending, setPromotionPending, legalMoves, logs,
    activePiece, showGameOverModal, squares, isGameOver, showSyncing,
    isCheck, isMyTurn, whiteCaptured, blackCaptured, pairedMoves,
    getEndGameReason, getActualIndex, getCoordsFromIndex, handleSquareClick,
    handleDragStart, handleDragEnd, formatTime
  } = useChessGameLogic(
    boardRepresentation, isStarted, gameStatus, currentTurn, moveHistory,
    lastMoveMessage, orientation, onMove, fetchLegalMoves, game
  );

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 -my-3 select-none overflow-x-auto">
      <div
        className="bg-[#111827]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 shadow-2xl flex flex-row items-center justify-center gap-6 mx-auto box-border"
        style={{ minWidth: '1050px', overflow: 'visible' }}
      >

        <div className="shrink-0 w-80 flex flex-col box-border" style={{ height: '624px' }}>
          <MatchInfoPanel
            orientation={orientation}
            currentTurn={currentTurn}
            isGameOver={isGameOver}
            whiteRemainingTimeMs={whiteRemainingTimeMs}
            blackRemainingTimeMs={blackRemainingTimeMs}
            whiteCaptured={whiteCaptured}
            blackCaptured={blackCaptured}
            pieceImages={PIECE_IMAGES}
            formatTime={formatTime}
            onDismissGame={onDismissGame}
            score={evaluationScore}
            evaluationType={evaluationType}
            hintData={hintData}
            isHintLoading={isHintLoading}
            onGetHint={() => { if (isMyTurn) onGetHint(); }}
            isMyTurn={isMyTurn}
            whitePlayerName={game?.whitePlayerName || "White Player"}
            blackPlayerName={game?.blackPlayerName || "Black Player"}
          />
        </div>

        <div className="flex flex-col items-center justify-center relative shrink-0 box-border" style={{ height: '624px', overflow: 'visible' }}>
          <BoardGrid
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            squares={squares}
            orientation={orientation}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            isCheck={isCheck}
            currentTurn={currentTurn}
            isStarted={isStarted}
            isGameOver={isGameOver}
            isMyTurn={isMyTurn}
            currentTheme={currentTheme}
            activePiece={activePiece}
            pieceImages={PIECE_IMAGES}
            getActualIndex={getActualIndex}
            getCoordsFromIndex={getCoordsFromIndex}
            handleSquareClick={handleSquareClick}
          />

          {showSyncing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center gap-4 z-50">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-white font-black text-xs uppercase tracking-[0.2em]">Synchronizing Game...</span>
            </div>
          )}
        </div>

        <div className="shrink-0 w-80 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex flex-col overflow-hidden transition-all shadow-inner box-border" style={{ height: '624px' }}>
          <div className="flex border-b border-slate-200 dark:border-slate-700/50 bg-slate-200/50 dark:bg-slate-900/60 p-1.5 gap-1.5 flex-none">
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Activity size={13} />
              Telemetry
            </button>
            <button
              onClick={() => setActiveTab('notation')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'notation'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <ListOrdered size={13} />
              Notation
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className={`h-full flex-col ${activeTab === 'telemetry' ? 'flex' : 'hidden'}`}>
              <TelemetrySidebar logs={logs} />
            </div>
            <div className={`h-full flex-col ${activeTab === 'notation' ? 'flex' : 'hidden'}`}>
              <NotationSidebar pairedMoves={pairedMoves} />
            </div>
          </div>
        </div>

      </div>

      {promotionPending && (
        <PromotionModal
          orientation={orientation}
          pieceImages={PIECE_IMAGES}
          onSelectPromotion={(type) => {
            const from = getCoordsFromIndex(promotionPending.from);
            const to = getCoordsFromIndex(promotionPending.to);
            onMove(from.file, from.rank, to.file, to.rank, type);
            setPromotionPending(null);
          }}
        />
      )}

      <GameOverModal
        show={showGameOverModal}
        endGameReason={getEndGameReason()}
        isTimeoutOrDismissed={gameStatus.includes('TIMEOUT') || gameStatus.includes('DISMISSED')}
        onBackToMenu={onBackToMenu || (() => window.location.reload())}
      />
    </div>
  );
};

export default ChessBoard;
