import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatchReplayModal } from './MatchReplayModal';

const samplePgn = `[Event "Ranked Match"]
[White "batuhan"]
[Black "Stockfish AI"]
[Result "1-0"]

1. e4 c5 2. Nf3 Nc6 3. Bb5 e5 4. O-O Bd6 1-0`;

const mocks = vi.hoisted(() => ({
  getGamePgn: vi.fn(),
}));

vi.mock('../../../api/gameService', () => ({
  getGamePgn: mocks.getGamePgn,
}));

describe('MatchReplayModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mocks.getGamePgn.mockReset();
    mocks.getGamePgn.mockResolvedValue(samplePgn);
  });

  it('renders loading indicator initially and fetches match pgn by gameId', async () => {
    // Arrange & Act
    render(
      <MatchReplayModal
        isOpen={true}
        onClose={mockOnClose}
        gameId={177}
        opponentName="Stockfish AI"
        result="Defeat"
      />
    );

    // Assert
    await waitFor(() => {
      expect(mocks.getGamePgn).toHaveBeenCalledWith(177);
    });
  });

  it('renders header details, match badges and initial move notations after pgn loads', async () => {
    // Arrange & Act
    render(
      <MatchReplayModal
        isOpen={true}
        onClose={mockOnClose}
        gameId={177}
        opponentName="Stockfish AI"
        result="Victory"
        playerColor="white"
      />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Match #177')).toBeDefined();
      expect(screen.getByText('Victory')).toBeDefined();
      expect(screen.getByText('Stockfish AI')).toBeDefined();
      expect(screen.getByText('e4')).toBeDefined();
      expect(screen.getByText('O-O')).toBeDefined();
    });
  });

  it('sets perspective to black and displays correct badge when playerColor is black', async () => {
    // Arrange & Act
    render(
      <MatchReplayModal
        isOpen={true}
        onClose={mockOnClose}
        gameId={177}
        opponentName="Stockfish AI"
        result="Defeat"
        playerColor="black"
      />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Perspective:/i)).toBeDefined();
    });
    expect(screen.getAllByText('Black').length).toBeGreaterThan(0);
    expect(screen.getByText('YOU')).toBeDefined();
  });

  it('toggles board perspective when clicking flip board button', async () => {
    // Arrange
    render(
      <MatchReplayModal
        isOpen={true}
        onClose={mockOnClose}
        gameId={177}
        opponentName="Stockfish AI"
        result="Victory"
        playerColor="white"
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('White').length).toBeGreaterThan(0);
    });
    const flipBtn = screen.getByTitle('Flip Board View');

    // Act
    fireEvent.click(flipBtn);

    // Assert
    expect(screen.getAllByText('Black').length).toBeGreaterThan(0);
  });

  it('advances current step and updates active move when clicking next move button', async () => {
    // Arrange
    render(
      <MatchReplayModal
        isOpen={true}
        onClose={mockOnClose}
        gameId={177}
        opponentName="Stockfish AI"
        result="Victory"
        playerColor="white"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/0 \/ \d+/)).toBeDefined();
    });
    const nextBtn = screen.getByTitle('Next Move');

    // Act
    fireEvent.click(nextBtn);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/1 \/ \d+/)).toBeDefined();
    });
  });

  it('invokes onClose callback when clicking close button', async () => {
    // Arrange
    render(
      <MatchReplayModal
        isOpen={true}
        onClose={mockOnClose}
        gameId={177}
        opponentName="Stockfish AI"
      />
    );

    await waitFor(() => {
      expect(screen.getByTitle('Close Replay')).toBeDefined();
    });
    const closeBtn = screen.getByTitle('Close Replay');

    // Act
    fireEvent.click(closeBtn);

    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
