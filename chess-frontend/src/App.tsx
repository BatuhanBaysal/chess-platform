import { useChess } from './hooks/useChess';
import ChessBoard from './components/ChessBoard';

function App() {
  const { game, makeMove, isConnected } = useChess();

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-blue-400 font-mono animate-pulse text-xl">
          INITIALIZING CHESS ENGINE...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-3xl font-bold text-blue-400 tracking-tighter">CHESS PLATFORM</h1>
        <div 
          className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} 
          title={isConnected ? "Online" : "Offline"}
        ></div>
      </div>

      <div className="flex gap-6 mb-6 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700 font-mono text-sm shadow-xl">
        <p>TURN: <span className="text-yellow-400 font-bold uppercase">{game.currentTurn}</span></p>
        <p className="text-slate-600">|</p>
        <p>STATUS: <span className="text-blue-300 font-bold uppercase">{game.status}</span></p>
      </div>

      <ChessBoard 
        boardRepresentation={game.boardRepresentation} 
        onMove={makeMove} 
      />
      
      <p className="mt-8 text-slate-500 text-xs font-mono">
        Game ID: {game.gameId}
      </p>
    </div>
  );
}

export default App;
