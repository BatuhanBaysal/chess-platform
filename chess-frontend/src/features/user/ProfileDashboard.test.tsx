import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileDashboard from './ProfileDashboard';
import * as userService from '../../api/userService';
import * as authHook from '../../hooks/useAuth';

vi.mock('../../api/userService', () => ({
  getMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
  changeMyPassword: vi.fn(),
  deleteMyAccount: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('ProfileDashboard Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    vi.mocked(authHook.useAuth).mockReturnValue({ logout: mockLogout } as any);
    
    vi.mocked(userService.getMyProfile).mockResolvedValue({
      username: 'testuser',
      email: 'test@chess.com',
      eloRating: 1200,
      totalWins: 5,
      totalLosses: 2,
      totalDraws: 1,
    } as any);
  });

  it('renders profile data and statistics successfully', async () => {
    // Act
    render(<ProfileDashboard />);

    // Assert
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeDefined();
      expect(screen.getByDisplayValue('test@chess.com')).toBeDefined();
      expect(screen.getByText('1200')).toBeDefined();
      expect(screen.getByText('5')).toBeDefined();
    });
  });
});
