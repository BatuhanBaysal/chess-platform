import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AllMatchHistory from './AllMatchHistory';
import * as gameService from '../../../api/gameService';

const serviceMocks = vi.hoisted(() => ({
  getPlayerHistory: vi.fn(),
  getGamePgn: vi.fn(() => Promise.resolve('1. e4 e5 1-0')),
}));

vi.mock('../../../api/gameService', () => ({
  getPlayerHistory: serviceMocks.getPlayerHistory,
  getGamePgn: serviceMocks.getGamePgn,
}));

describe('AllMatchHistory Tabbed Component', () => {
  const mockMatches = [
    {
      id: 101,
      whitePlayerId: 1,
      whitePlayerName: 'batuhanbaysal',
      blackPlayerId: 2,
      blackPlayerName: 'grandmaster',
      result: '1-0',
      finishMethod: 'CHECKMATE',
      playedAt: '2026-10-15T10:00:00Z',
    },
    {
      id: 102,
      whitePlayerId: 1,
      whitePlayerName: 'batuhanbaysal',
      blackPlayerId: null,
      blackPlayerName: 'Stockfish AI',
      result: '0-1',
      finishMethod: 'RESIGNATION',
      playedAt: '2026-10-16T12:00:00Z',
    },
    {
      id: 103,
      whitePlayerId: 2,
      whitePlayerName: 'guest_opponent',
      blackPlayerId: 1,
      blackPlayerName: 'batuhanbaysal',
      result: '1/2-1/2',
      finishMethod: 'STALEMATE',
      playedAt: '2026-10-17T14:00:00Z',
    },
  ];

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    localStorage.setItem('userId', '1');
    localStorage.setItem('username', 'batuhanbaysal');
    vi.mocked(gameService.getPlayerHistory).mockResolvedValue(mockMatches as any);
    vi.mocked(gameService.getGamePgn).mockResolvedValue('1. e4 e5 1-0');
  });

  it('renders ranked matches by default and displays correct tab count', async () => {
    // Arrange & Act
    render(
      <MemoryRouter>
        <AllMatchHistory userId={1} />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('grandmaster')).toBeDefined();
    });
    expect(screen.getByText(/Ranked \(PvP\) \(2\)/i)).toBeDefined();
    expect(screen.getByText(/AI Practice \(1\)/i)).toBeDefined();
    expect(screen.queryByText('Stockfish AI')).toBeNull();
  });

  it('renders opponent avatar image for registered ranked players and handles draw outcomes', async () => {
    // Arrange & Act
    render(
      <MemoryRouter>
        <AllMatchHistory userId={1} />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      const avatarImg = screen.getByRole('img', { name: 'grandmaster' }) as HTMLImageElement;
      expect(avatarImg).toBeDefined();
      expect(avatarImg.src).toContain('/api/users/grandmaster/avatar');
      expect(screen.getByText('guest_opponent')).toBeDefined();
      expect(screen.getByText('Draw')).toBeDefined();
    });
  });

  it('switches to AI Practice tab and displays AI matches with bot icon', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <AllMatchHistory userId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('grandmaster')).toBeDefined();
    });

    const aiTabButton = screen.getByRole('button', { name: /AI Practice/i });

    // Act
    fireEvent.click(aiTabButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Stockfish AI')).toBeDefined();
      expect(screen.getByText('AI')).toBeDefined();
    });
    expect(screen.queryByText('grandmaster')).toBeNull();
  });

  it('opens replay modal when clicking replay button on a match row', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <AllMatchHistory userId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('grandmaster')).toBeDefined();
    });

    const replayButtons = screen.getAllByRole('button', { name: /replay/i });

    // Act
    fireEvent.click(replayButtons[0]);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Match #101')).toBeDefined();
    });
  });

  it('hides avatar image on error and falls back to opponent initial', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <AllMatchHistory userId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'grandmaster' })).toBeDefined();
    });

    const avatarImg = screen.getByRole('img', { name: 'grandmaster' }) as HTMLImageElement;

    // Act
    fireEvent.error(avatarImg);

    // Assert
    expect(avatarImg.style.display).toBe('none');
    expect(screen.getAllByText('G').length).toBeGreaterThan(0);
  });

  it('displays empty state notice when user has no match records', async () => {
    // Arrange
    vi.mocked(gameService.getPlayerHistory).mockResolvedValue([]);

    // Act
    render(
      <MemoryRouter>
        <AllMatchHistory userId={1} />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('No Ranked Matches Yet')).toBeDefined();
    });
  });

  it('navigates through pages when matches exceed page size', async () => {
    // Arrange
    const manyMatches = Array.from({ length: 15 }, (_, i) => ({
      id: 200 + i,
      whitePlayerId: 1,
      whitePlayerName: 'batuhanbaysal',
      blackPlayerId: 10 + i,
      blackPlayerName: `opponent_${i}`,
      result: '1-0',
      finishMethod: 'CHECKMATE',
      playedAt: '2026-10-18T10:00:00Z',
    }));
    vi.mocked(gameService.getPlayerHistory).mockResolvedValue(manyMatches as any);

    render(
      <MemoryRouter>
        <AllMatchHistory userId={1} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('opponent_0')).toBeDefined();
    });

    // Act
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextBtn);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('opponent_10')).toBeDefined();
      expect(screen.queryByText('opponent_0')).toBeNull();
    });
  });
});
