import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatchReplayModal } from './MatchReplayModal';

const samplePgn = `[Event "Ranked Match"]
[White "Stockfish AI"]
[Black "batuhan"]
[Result "1/2-1/2"]

1. e4 c5 2. Nf3 Nc6 3. Bb5 e5 4. O-O-O O-O 5. d4 exd4 6. c3 dxc3 7. e8=Q c1=N 8. e8=B c1=R 9. e8=Q c1=q 1/2-1/2`;

const mocks = vi.hoisted(() => ({
  getGamePgn: vi.fn(),
}));

vi.mock('../../../api/gameService', () => ({
  getGamePgn: mocks.getGamePgn,
}));

describe('MatchReplayModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
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

  it('renders header details, draw badge, and parses O-O-O and promotions properly', async () => {
    // Arrange & Act
    render(
      <MatchReplayModal
        isOpen={true}
        onClose={mockOnClose}
        gameId={177}
        opponentName="Stockfish AI"
        result="Draw"
        playerColor="white"
      />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Match #177')).toBeDefined();
      expect(screen.getByText('Draw')).toBeDefined();
      expect(screen.getAllByText('Stockfish AI').length).toBeGreaterThan(0);
      expect(screen.getAllByText('O-O-O').length).toBeGreaterThan(0);
    });
  });

  it('renders error notice when getGamePgn rejects', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.getGamePgn.mockRejectedValueOnce(new Error('Network error'));

    // Act
    render(
      <MatchReplayModal
        isOpen={true}
        onClose={mockOnClose}
        gameId={999}
        opponentName="Stockfish AI"
      />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/PGN record could not be retrieved/i)).toBeDefined();
    });
  });

  it('renders empty move message when pgn has no moves', async () => {
    // Arrange
    mocks.getGamePgn.mockResolvedValueOnce('[Event "Empty"]\n[Result "*"]\n*');

    // Act
    render(
      <MatchReplayModal
        isOpen={true}
        onClose={mockOnClose}
        gameId={200}
        opponentName="Opponent"
      />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/No moves recorded in PGN/i)).toBeDefined();
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
        opponentName="HumanOpponent"
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

  it('navigates through steps using First, Previous, Next and Last move buttons', async () => {
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
    const lastBtn = screen.getByTitle('Last Move');
    const prevBtn = screen.getByTitle('Previous Move');
    const firstBtn = screen.getByTitle('First Move');

    // Act & Assert
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.getByText(/1 \/ \d+/)).toBeDefined();
    });

    // Act & Assert
    fireEvent.click(prevBtn);
    expect(screen.getByText(/0 \/ \d+/)).toBeDefined();

    // Act & Assert
    fireEvent.click(lastBtn);
    expect(screen.queryByText(/0 \/ \d+/)).toBeNull();

    // Act & Assert
    fireEvent.click(firstBtn);
    expect(screen.getByText(/0 \/ \d+/)).toBeDefined();
  });

  it('jumps directly to a step when clicking on a move in the notation list', async () => {
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
      expect(screen.getAllByText('e4').length).toBeGreaterThan(0);
    });
    const e4Button = screen.getAllByRole('button', { name: 'e4' })[0];

    // Act
    fireEvent.click(e4Button);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/1 \/ \d+/)).toBeDefined();
    });
  });

  it('toggles autoplay playback with Play and Pause button', async () => {
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
      expect(screen.getByText('Match #177')).toBeDefined();
    });

    const playBtn = await screen.findByRole('button', { name: /^play$/i });

    // Act
    fireEvent.click(playBtn);

    // Assert
    const pauseBtn = await screen.findByRole('button', { name: /^pause$/i });
    expect(pauseBtn).toBeDefined();

    // Act
    fireEvent.click(pauseBtn);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^play$/i })).toBeDefined();
    });
  });

  it('triggers file download when clicking download PGN button', async () => {
    // Arrange
    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    render(
      <MatchReplayModal
        isOpen={true}
        onClose={mockOnClose}
        gameId={177}
        opponentName="Stockfish AI"
      />
    );

    await waitFor(() => {
      expect(screen.getByTitle('Download PGN')).toBeDefined();
    });
    const downloadBtn = screen.getByTitle('Download PGN');

    // Act
    fireEvent.click(downloadBtn);

    // Assert
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('invokes onClose callback when clicking close button or backdrop', async () => {
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

  it('returns null when isOpen is false', () => {
    // Arrange & Act
    const { container } = render(
      <MatchReplayModal
        isOpen={false}
        onClose={mockOnClose}
        gameId={177}
      />
    );

    // Assert
    expect(container.firstChild).toBeNull();
  });
});
