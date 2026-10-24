import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';
import * as AuthHook from '../../hooks/useAuth';
import * as userService from '../../api/userService';
import * as gameService from '../../api/gameService';

vi.mock('../../api/userService', () => ({
  getMyProfile: vi.fn(),
  getLeaderboard: vi.fn(),
}));

vi.mock('../../api/gameService', () => ({
  getActiveGame: vi.fn(),
  getPlayerHistory: vi.fn(),
}));

describe('LandingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginAsGuest: vi.fn(),
      updateUser: vi.fn(),
      loading: false,
    });

    vi.mocked(userService.getMyProfile).mockResolvedValue({
      id: 1,
      username: 'batuhan',
      eloRating: 1250,
      totalWins: 10,
      totalLosses: 2,
      totalDraws: 1,
    } as any);

    vi.mocked(userService.getLeaderboard).mockResolvedValue([]);
    vi.mocked(gameService.getActiveGame).mockResolvedValue(null as any);
    vi.mocked(gameService.getPlayerHistory).mockResolvedValue([]);
  });

  it('renders platform hub navigation buttons properly', async () => {
    // Arrange & Act
    render(
      <MemoryRouter>
        <LandingPage onStart={vi.fn()} />
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText('PLATFORM HUB')).toBeDefined();
    expect(screen.getByText('About Developer')).toBeDefined();
    expect(screen.getByText('Contact & Inquiries')).toBeDefined();
    expect(screen.getByText('Release Notes')).toBeDefined();
  });
});
