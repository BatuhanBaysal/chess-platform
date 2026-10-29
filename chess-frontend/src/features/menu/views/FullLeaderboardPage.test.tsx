import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import FullLeaderboardPage from './FullLeaderboardPage';
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
  getFullLeaderboard: vi.fn(),
}));

describe('FullLeaderboardPage Component', () => {
  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
  });

  it('renders podium rankings, alternate rows, avatar fallbacks, and win rates', async () => {
    // Arrange
    vi.mocked(userService.getFullLeaderboard).mockResolvedValueOnce({
      content: [
        {
          username: 'first_place',
          eloRating: 2500,
          totalWins: 50,
          totalLosses: 10,
          totalDraws: 5,
          totalGames: 65,
          avatarUrl: '/avatar1.png',
        },
        {
          username: 'second_place',
          eloRating: 2300,
          totalWins: 30,
          totalLosses: 10,
          totalDraws: 10,
          totalGames: 50,
          avatarUrl: null,
        },
        {
          username: 'third_place',
          eloRating: 2100,
          totalWins: 20,
          totalLosses: 10,
          totalDraws: 5,
          totalGames: 35,
          avatarUrl: null,
        },
        {
          username: 'fourth_place',
          eloRating: 1800,
          totalWins: 0,
          totalLosses: 0,
          totalDraws: 0,
          totalGames: 0,
          avatarUrl: null,
        },
      ],
      totalPages: 3,
      totalElements: 25,
    } as any);

    // Act
    render(
      <MemoryRouter>
        <FullLeaderboardPage />
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText(/global rankings/i)).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('first_place')).toBeDefined();
      expect(screen.getByText('second_place')).toBeDefined();
      expect(screen.getByText('third_place')).toBeDefined();
      expect(screen.getByText('fourth_place')).toBeDefined();
      expect(screen.getByText('#4')).toBeDefined();
      expect(screen.getByText('0%')).toBeDefined();
    });
  });

  it('handles page change and fetches new leaderboard page', async () => {
    // Arrange
    vi.mocked(userService.getFullLeaderboard).mockResolvedValue({
      content: [
        {
          username: 'page_player',
          eloRating: 1500,
          totalWins: 5,
          totalLosses: 5,
          totalDraws: 0,
          totalGames: 10,
          avatarUrl: null,
        },
      ],
      totalPages: 2,
      totalElements: 11,
    } as any);

    render(
      <MemoryRouter>
        <FullLeaderboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('page_player')).toBeDefined();
    });

    // Act
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextBtn);

    // Assert
    await waitFor(() => {
      expect(userService.getFullLeaderboard).toHaveBeenCalledWith(1, 10);
    });
  });

  it('handles api failure gracefully without crashing', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(userService.getFullLeaderboard).mockRejectedValueOnce(new Error('Network error'));

    // Act
    render(
      <MemoryRouter>
        <FullLeaderboardPage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/no players found/i)).toBeDefined();
    });
  });

  it('navigates back to menu when back button is clicked', async () => {
    // Arrange
    vi.mocked(userService.getFullLeaderboard).mockResolvedValueOnce({
      content: [],
      totalPages: 1,
      totalElements: 0,
    } as any);

    render(
      <MemoryRouter>
        <FullLeaderboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no players found/i)).toBeDefined();
    });

    // Act
    const backBtn = screen.getByRole('button', { name: /back to menu/i });
    fireEvent.click(backBtn);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/menu');
  });
});
