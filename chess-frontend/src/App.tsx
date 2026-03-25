import { useChess } from './hooks/useChess';
import ChessBoard from './components/ChessBoard';

function App() {
  const { game, makeMove, isConnected, fetchLegalMoves, startNewGame } = useChess();

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to start a new game?")) {
      startNewGame();
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-blue-400 font-mono animate-pulse text-xl text-center tracking-widest">
            INITIALIZING CHESS ENGINE...
          </div>
        </div>
      </div>
    );
  }

  const isCheck = game.status === 'CHECK';
  const isCheckmate = game.status === 'CHECKMATE';
  const turn = game.currentTurn.toUpperCase();

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black text-white tracking-tighter italic">
            CHESS<span className="text-blue-500">PLATFORM</span>
          </h1>
          <div 
            className={`w-3 h-3 rounded-full shadow-lg ${isConnected ? 'bg-green-500 animate-pulse shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`} 
            title={isConnected ? "Server Online" : "Server Offline"}
          ></div>
        </div>
        <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">Real-time Strategic Operations</p>
      </div>

      <div className={`flex gap-8 mb-6 bg-slate-900/80 backdrop-blur-md p-4 px-8 rounded-2xl border font-mono text-sm shadow-2xl items-center transition-all duration-500 
        ${isCheck || isCheckmate ? 'border-red-500/50 bg-red-950/20' : 'border-slate-800'}`}>
        
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-md border-2 transition-all duration-500 
            ${turn === 'WHITE' 
              ? 'bg-white border-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
              : 'bg-slate-800 border-slate-600 shadow-[0_0_15px_rgba(0,0,0,0.8)]'}`}>
          </div>
          <p className="tracking-tight">TURN: <span className="text-blue-400 font-black uppercase">{game.currentTurn}</span></p>
        </div>
        
        <div className="w-px h-4 bg-slate-800"></div>
        
        <div className="flex items-center gap-3">
          <p className="tracking-tight">STATUS: 
            <span className={`ml-2 font-black uppercase ${isCheck || isCheckmate ? 'text-red-500' : 'text-emerald-400'}`}>
              {game.status}
            </span>
          </p>
          {(isCheck || isCheckmate) && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
          )}
        </div>
      </div>

      <ChessBoard 
        boardRepresentation={game.boardRepresentation} 
        gameStatus={game.status}
        currentTurn={game.currentTurn} 
        moveHistory={game.moveHistory || []} 
        lastMoveMessage={game.lastMoveMessage || ""}
        onMove={makeMove} 
        fetchLegalMoves={fetchLegalMoves}
        onNewGame={handleRestart} 
      />
      
      <div className="mt-8 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-slate-500 text-[10px] font-mono bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
          SESSION_ID: {game.gameId}
        </p>
        <p className="text-slate-600 text-[9px] font-mono italic">
          v1.0.5-stable • React 19 + Spring Boot + STOMP
        </p>
      </div>
    </div>
  );
}

export default App;
