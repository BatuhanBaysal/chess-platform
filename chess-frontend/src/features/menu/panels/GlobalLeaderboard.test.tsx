import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import GlobalLeaderboard from './GlobalLeaderboard';
import * as userService from '../../../api/userService';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../api/userService', () => ({
  getLeaderboard: vi.fn(),
}));

describe('GlobalLeaderboard Component', () => {
  const mockLeaderboardData = [
    {
      username: 'batuhan',
      eloRating: 1250,
      totalWins: 10,
      totalLosses: 2,
      totalDraws: 1,
      avatarUrl: '/api/users/batuhan/avatar',
    },
    {
      username: 'grandmaster',
      eloRating: 1200,
      totalWins: 5,
      totalLosses: 3,
      totalDraws: 0,
      avatarUrl: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  it('renders top players with avatars and fallback initials correctly', async () => {
    // Arrange
    vi.mocked(userService.getLeaderboard).mockResolvedValue(mockLeaderboardData as any);

    // Act
    render(
      <MemoryRouter>
        <GlobalLeaderboard />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('batuhan')).toBeDefined();
      expect(screen.getByText('grandmaster')).toBeDefined();
    });

    const avatarImg = screen.getByRole('img', { name: 'batuhan' }) as HTMLImageElement;
    expect(avatarImg).toBeDefined();
    expect(avatarImg.src).toContain('/api/users/batuhan/avatar');
    expect(screen.getByText('G')).toBeDefined();
    expect(screen.getByText('1250')).toBeDefined();
    expect(screen.getByText('1200')).toBeDefined();
  });

  it('navigates to full leaderboard page when clicking VIEW ALL button', async () => {
    // Arrange
    vi.mocked(userService.getLeaderboard).mockResolvedValue(mockLeaderboardData as any);

    render(
      <MemoryRouter>
        <GlobalLeaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('batuhan')).toBeDefined();
    });

    const viewAllBtn = screen.getByRole('button', { name: /VIEW ALL/i });

    // Act
    fireEvent.click(viewAllBtn);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/leaderboard');
  });

  it('displays empty state notice when no active players are returned', async () => {
    // Arrange
    vi.mocked(userService.getLeaderboard).mockResolvedValue([]);

    // Act
    render(
      <MemoryRouter>
        <GlobalLeaderboard />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('No active players found.')).toBeDefined();
    });
  });

  it('handles backend service failure gracefully and renders empty state', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(userService.getLeaderboard).mockRejectedValue(new Error('Network error'));

    // Act
    render(
      <MemoryRouter>
        <GlobalLeaderboard />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('No active players found.')).toBeDefined();
    });
  });
});
