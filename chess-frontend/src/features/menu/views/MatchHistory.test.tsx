import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchHistory from './MatchHistory';
import * as gameService from '../../../api/gameService';

vi.mock('../../../api/gameService', () => ({
  getPlayerHistory: vi.fn(),
}));

describe('MatchHistory Widget Component', () => {
  const mockHistoryData = [
    {
      id: 201,
      whitePlayerId: 1,
      whitePlayerName: 'batuhan',
      blackPlayerId: 2,
      blackPlayerName: 'magnus',
      result: '1-0',
      finishMethod: 'CHECKMATE',
      playedAt: '2026-10-20T14:30:00Z',
    },
    {
      id: 202,
      whitePlayerId: 1,
      whitePlayerName: 'batuhan',
      blackPlayerId: null,
      blackPlayerName: 'Stockfish AI',
      result: '0-1',
      finishMethod: 'RESIGNATION',
      playedAt: '2026-10-21T18:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('userId', '1');
    localStorage.setItem('username', 'batuhan');
    vi.mocked(gameService.getPlayerHistory).mockResolvedValue(mockHistoryData as any);
  });

  it('renders recorded match count and opponent rows successfully', async () => {
    // Arrange & Act
    render(<MatchHistory userId={1} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('magnus')).toBeDefined();
      expect(screen.getByText('Stockfish AI')).toBeDefined();
    });

    expect(screen.getByText(/2 Matches Recorded/i)).toBeDefined();
    expect(screen.getByText('Victory')).toBeDefined();
    expect(screen.getByText('Defeat')).toBeDefined();
  });

  it('renders opponent avatar image for registered users and bot icon for AI', async () => {
    // Arrange & Act
    render(<MatchHistory userId={1} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('magnus')).toBeDefined();
    });

    const opponentAvatar = screen.getByRole('img', { name: 'magnus' }) as HTMLImageElement;
    expect(opponentAvatar).toBeDefined();
    expect(opponentAvatar.src).toContain('/api/users/magnus/avatar');
    expect(screen.getByText('AI')).toBeDefined();
  });

  it('refetches history when clicking refresh button', async () => {
    // Arrange
    render(<MatchHistory userId={1} />);
    await waitFor(() => {
      expect(screen.getByText('magnus')).toBeDefined();
    });

    const refreshBtn = screen.getByTitle('Refresh match history');

    // Act
    fireEvent.click(refreshBtn);

    // Assert
    await waitFor(() => {
      expect(gameService.getPlayerHistory).toHaveBeenCalledTimes(2);
    });
  });

  it('hides opponent avatar on load error and displays fallback initial', async () => {
    // Arrange
    render(<MatchHistory userId={1} />);
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'magnus' })).toBeDefined();
    });

    const avatarImg = screen.getByRole('img', { name: 'magnus' }) as HTMLImageElement;

    // Act
    fireEvent.error(avatarImg);

    // Assert
    expect(avatarImg.style.display).toBe('none');
    expect(screen.getByText('M')).toBeDefined();
  });

  it('renders empty placeholder when no match records are returned', async () => {
    // Arrange
    vi.mocked(gameService.getPlayerHistory).mockResolvedValue([]);

    // Act
    render(<MatchHistory userId={1} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('No match data recorded')).toBeDefined();
    });
  });

  it('handles API failure gracefully and displays empty state', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(gameService.getPlayerHistory).mockRejectedValue(new Error('API failure'));

    // Act
    render(<MatchHistory userId={1} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('No match data recorded')).toBeDefined();
    });
  });
});
