import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChessBoard } from './ChessBoard';

describe('ChessBoard Component', () => {
  it('renders chess board and telemetry/notation tabs without crashing', () => {
    // Arrange
    render(
      <ChessBoard
        boardRepresentation="rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR"
        isStarted={true}
        gameStatus="IN_PROGRESS"
        currentTurn="WHITE"
        moveHistory={[]}
        lastMoveMessage=""
        onMove={vi.fn()}
        fetchLegalMoves={async () => []}
        onBackToMenu={vi.fn()}
        onDismissGame={vi.fn()}
        theme="modern"
        timeLimit={10}
        orientation="WHITE"
      />
    );

    // Assert
    expect(screen.getByText('Telemetry')).toBeDefined();
    expect(screen.getAllByText('Notation').length).toBeGreaterThan(0);
  });
});
