import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActiveGameView } from './ActiveGameView';

vi.mock('./ChessBoard', () => ({
  default: ({ onMove, onBackToMenu, onNewGame }: any) => (
    <div data-testid="mock-chessboard">
      <button onClick={() => onMove(0, 1, 0, 3, 'QUEEN')}>Move</button>
      <button onClick={onBackToMenu}>Back</button>
      <button onClick={onNewGame}>New Game</button>
    </div>
  ),
}));

describe('ActiveGameView Component', () => {
  const baseProps = {
    game: null,
    isConnected: false,
    playerColor: 'WHITE',
    hintData: null,
    isHintLoading: false,
    evaluation: { score: 10, type: 'CP' },
    onMove: vi.fn(),
    fetchLegalMoves: vi.fn().mockResolvedValue([]),
    onRestart: vi.fn(),
    onBackToMenu: vi.fn(),
    fetchHint: vi.fn(),
  };

  it('renders connecting telemetry radar and triggers cancel on button click', () => {
    // Arrange
    const handleBack = vi.fn();
    render(<ActiveGameView {...baseProps} isConnected={false} onBackToMenu={handleBack} />);

    // Assert
    expect(screen.getByText(/establishing connection/i)).toBeDefined();
    expect(screen.getByText(/synchronizing game state/i)).toBeDefined();

    // Act
    fireEvent.click(screen.getByRole('button', { name: /cancel matchmaking/i }));

    // Assert
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('renders live ChessBoard when game is present and connected', () => {
    // Arrange
    const game = {
      gameId: 'game-123',
      boardRepresentation: 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR',
      isStarted: true,
      status: 'ACTIVE',
      currentTurn: 'WHITE',
      moveHistory: ['e4'],
      lastMoveMessage: 'e4 played',
    };

    // Act
    render(
      <ActiveGameView
        {...baseProps}
        game={game}
        isConnected={true}
        playerColor="WHITE"
        gameConfig={{ theme: 'emerald', timeControl: 3, roomId: 'room-99' }}
      />
    );

    // Assert
    expect(screen.getByTestId('mock-chessboard')).toBeDefined();

    // Act
    fireEvent.click(screen.getByText('Move'));
    expect(baseProps.onMove).toHaveBeenCalledWith(0, 1, 0, 3, 'QUEEN');
  });

  it('displays Stockfish AI mode badge when game has AI indicator', () => {
    // Arrange
    const aiGame = {
      gameId: 'ai-game',
      gameType: 'AI',
      mode: 'AI',
    };

    // Act
    render(<ActiveGameView {...baseProps} game={aiGame} isConnected={false} />);

    // Assert
    expect(screen.getByText(/stockfish ai/i)).toBeDefined();
  });
});
