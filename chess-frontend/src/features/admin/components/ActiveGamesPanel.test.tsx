import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActiveGamesPanel from './ActiveGamesPanel';

describe('ActiveGamesPanel Component', () => {
  const defaultProps = {
    activeGames: [
      {
        gameId: 'session-alpha-1',
        whitePlayerId: 10,
        blackPlayerId: null,
        status: 'IN_PROGRESS',
      },
    ] as any,
    loading: false,
    onForceFinish: vi.fn(),
  };

  it('renders active sessions table and formats AI vs User names properly', () => {
    // Arrange & Act
    render(<ActiveGamesPanel {...defaultProps} />);

    // Assert
    expect(screen.getByText('session-alpha-1')).toBeDefined();
    expect(screen.getByText(/User #10 \(W\)/)).toBeDefined();
    expect(screen.getByText(/vs Stockfish AI \(B\)/)).toBeDefined();
    expect(screen.getByText('IN_PROGRESS')).toBeDefined();
  });

  it('triggers onForceFinish when terminate button is clicked', () => {
    // Arrange
    render(<ActiveGamesPanel {...defaultProps} />);

    // Act
    const terminateBtn = screen.getByRole('button', { name: /terminate/i });
    fireEvent.click(terminateBtn);

    // Assert
    expect(defaultProps.onForceFinish).toHaveBeenCalledWith('session-alpha-1');
  });

  it('renders loading spinner when loading is true', () => {
    // Arrange & Act
    render(<ActiveGamesPanel {...defaultProps} loading={true} />);

    // Assert
    expect(screen.getByText(/polling sessions.../i)).toBeDefined();
  });

  it('renders empty notice when activeGames array is empty', () => {
    // Arrange & Act
    render(<ActiveGamesPanel {...defaultProps} activeGames={[]} />);

    // Assert
    expect(screen.getByText(/no active matchmaking sessions currently deployed/i)).toBeDefined();
  });
});
