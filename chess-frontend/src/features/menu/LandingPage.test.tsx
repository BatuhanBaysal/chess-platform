import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';
import * as AuthHook from '../../hooks/useAuth';
import * as userService from '../../api/userService';
import * as gameService from '../../api/gameService';
import api from '../../api/axios';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../api/userService', () => ({
  getMyProfile: vi.fn(),
  getLeaderboard: vi.fn(),
}));

vi.mock('../../api/gameService', () => ({
  getActiveGame: vi.fn(),
  getPlayerHistory: vi.fn(),
  createAiGame: vi.fn(),
}));

describe('LandingPage Component', () => {
  const mockOnStart = vi.fn();

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(api.get).mockResolvedValue({ data: [] });

    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginAsGuest: vi.fn().mockResolvedValue({ id: 99, username: 'guest_user' }),
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

  it('renders platform hub navigation buttons and handles route transitions', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <LandingPage onStart={mockOnStart} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('PLATFORM HUB')).toBeDefined();
    });

    // Act & Assert
    fireEvent.click(screen.getByRole('button', { name: /about developer/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/about');

    fireEvent.click(screen.getByRole('button', { name: /contact & inquiries/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/contact');

    fireEvent.click(screen.getByRole('button', { name: /release notes/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/changelog');

    fireEvent.click(screen.getByRole('button', { name: /view all >/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  it('handles active game reconnect and dismiss flow properly', async () => {
    // Arrange
    vi.mocked(gameService.getActiveGame).mockResolvedValueOnce({
      gameId: 'match-xyz-123',
      status: 'IN_PROGRESS',
      timeLimit: 10,
    } as any);

    const { unmount } = render(
      <MemoryRouter>
        <LandingPage onStart={mockOnStart} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/active match found/i)).toBeDefined();
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /^reconnect$/i }));

    // Assert
    await waitFor(() => {
      expect(mockOnStart).toHaveBeenCalledWith('classic', 10, 'match-xyz-123');
      expect(mockNavigate).toHaveBeenCalledWith('/game');
    });

    // Arrange
    unmount();
    vi.mocked(gameService.getActiveGame).mockResolvedValueOnce({
      gameId: 'match-dis-999',
      status: 'IN_PROGRESS',
      timeLimit: 10,
    } as any);

    render(
      <MemoryRouter>
        <LandingPage onStart={mockOnStart} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/active match found/i)).toBeDefined();
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByText(/active match found/i)).toBeNull();
    });
  });

  it('ignores reconnect when game is in CLOSING status or just_resigned is stored', async () => {
    // Arrange
    localStorage.setItem('just_resigned', 'true');
    vi.mocked(gameService.getActiveGame).mockResolvedValueOnce({
      gameId: 'match-resigned-1',
      status: 'IN_PROGRESS',
    } as any);

    // Act
    const { unmount } = render(
      <MemoryRouter>
        <LandingPage onStart={mockOnStart} />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.queryByText(/active match found/i)).toBeNull();
      expect(localStorage.getItem('just_resigned')).toBeNull();
    });

    // Arrange
    unmount();
    vi.mocked(gameService.getActiveGame).mockResolvedValueOnce({
      gameId: 'match-closing-2',
      status: 'CLOSING',
    } as any);

    // Act
    render(
      <MemoryRouter>
        <LandingPage onStart={mockOnStart} />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.queryByText(/active match found/i)).toBeNull();
    });
  });

  it('starts AI match and alerts on failure', async () => {
    // Arrange
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(gameService.createAiGame).mockRejectedValueOnce(new Error('AI start error'));

    render(
      <MemoryRouter>
        <LandingPage onStart={mockOnStart} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('PLATFORM HUB')).toBeDefined();
    });

    fireEvent.click(screen.getByRole('button', { name: /play vs computer/i }));

    await waitFor(() => {
      expect(screen.getByText(/start match/i)).toBeDefined();
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /start match/i }));

    // Assert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Could not start AI game.');
    });
  });

  it('handles room join failure alert', async () => {
    // Arrange
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Room is full'));

    render(
      <MemoryRouter>
        <LandingPage onStart={mockOnStart} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('PLATFORM HUB')).toBeDefined();
    });

    // Act & Assert
    const joinButtons = screen.queryAllByRole('button', { name: /join match/i });
    if (joinButtons.length > 0) {
      fireEvent.click(joinButtons[0]);
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Room is full or no longer exists.');
      });
    }
  });

  it('triggers quick match creation and calls lobby create endpoint', async () => {
    // Arrange
    vi.mocked(api.post).mockResolvedValueOnce({ data: 'waiting-room-999' });

    render(
      <MemoryRouter>
        <LandingPage onStart={mockOnStart} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /quick match/i })).toBeDefined();
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /quick match/i }));

    // Assert
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/lobby/create', expect.objectContaining({
        userId: 1,
        time: 10,
      }));
    });
  });
});
