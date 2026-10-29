import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import * as AuthHook from './hooks/useAuth';
import * as chessHook from './features/chess/hooks/useChess';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

vi.mock('./api/axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('./api/userService', () => ({
  getLeaderboard: vi.fn().mockResolvedValue([]),
  getMyProfile: vi.fn().mockResolvedValue({ username: 'grandmaster' }),
}));

vi.mock('./api/gameService', () => ({
  getActiveGame: vi.fn().mockResolvedValue(null),
  getPlayerHistory: vi.fn().mockResolvedValue([]),
  createAiGame: vi.fn().mockResolvedValue({}),
}));

vi.mock('./features/auth/AuthContainer', () => ({
  default: ({ onLogin, onRegister, onGuestLogin }: any) => (
    <div data-testid="mock-auth-container">
      <button onClick={() => onLogin('player1', 'pass123')}>Login Submit</button>
      <button onClick={() => onRegister('player1', 'pass123', 'p1@test.com')}>Register Submit</button>
      <button onClick={() => onGuestLogin()}>Guest Submit</button>
    </div>
  ),
}));

vi.mock('./routes/AppRoutes', () => ({
  AppRoutes: ({ onMoveInternal }: any) => (
    <div data-testid="mock-app-routes">
      <button onClick={() => onMoveInternal(0, 1, 0, 3, 'QUEEN')}>Trigger Internal Move</button>
    </div>
  ),
}));

describe('App Component', () => {
  const mockLogin = vi.fn();
  const mockRegister = vi.fn();
  const mockLoginAsGuest = vi.fn();
  const mockMakeMove = vi.fn();

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    localStorage.clear();

    delete (window as any).location;
    window.location = { href: '' } as any;

    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
      login: mockLogin,
      register: mockRegister,
      loginAsGuest: mockLoginAsGuest,
      loading: false,
    } as any);

    vi.spyOn(chessHook, 'useChess').mockReturnValue({
      game: null,
      makeMove: mockMakeMove,
      isConnected: true,
      fetchLegalMoves: vi.fn(),
      startNewGame: vi.fn(),
      playerColor: 'WHITE',
      resetChessState: vi.fn(),
      hintData: null,
      isHintLoading: false,
      fetchHint: vi.fn(),
      evaluation: { score: 0, type: 'CP' },
    } as any);
  });

  it('renders auth credentials loader when authLoading is true', () => {
    // Arrange
    vi.spyOn(AuthHook, 'useAuth').mockReturnValueOnce({
      user: null,
      loading: true,
    } as any);

    // Act
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText(/syncing credentials/i)).toBeDefined();
  });

  it('syncs saved preferred_theme and user details from localStorage', async () => {
    // Arrange
    localStorage.setItem('preferred_theme', 'emerald');

    // Act
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(localStorage.getItem('preferred_theme')).toBe('emerald');
      expect(localStorage.getItem('username')).toBe('batuhan');
      expect(localStorage.getItem('userId')).toBe('1');
    });
  });

  it('handles user login flow, persists session and redirects to /menu', async () => {
    // Arrange
    mockLogin.mockResolvedValueOnce({
      user: { id: 10, username: 'chessmaster', role: 'ROLE_USER' },
    });

    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <App />
      </MemoryRouter>
    );

    // Act
    const loginBtn = await screen.findByRole('button', { name: /login submit/i });
    fireEvent.click(loginBtn);

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ usernameOrEmail: 'player1', password: 'pass123' });
      expect(localStorage.getItem('username')).toBe('chessmaster');
      expect(localStorage.getItem('userRole')).toBe('ROLE_USER');
      expect(window.location.href).toBe('/menu');
    });
  });

  it('handles guest login flow, sets role and redirects to /menu', async () => {
    // Arrange
    mockLoginAsGuest.mockResolvedValueOnce({
      user: { id: 99, username: 'Guest_99', role: 'ROLE_GUEST' },
    });

    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <App />
      </MemoryRouter>
    );

    // Act
    const guestBtn = await screen.findByRole('button', { name: /guest submit/i });
    fireEvent.click(guestBtn);

    // Assert
    await waitFor(() => {
      expect(mockLoginAsGuest).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('username')).toBe('Guest_99');
      expect(localStorage.getItem('userRole')).toBe('ROLE_GUEST');
      expect(window.location.href).toBe('/menu');
    });
  });

  it('triggers onMoveInternal through AppRoutes integration', async () => {
    // Arrange
    vi.spyOn(chessHook, 'useChess').mockReturnValueOnce({
      game: { gameId: 'room-live-42' },
      makeMove: mockMakeMove,
      isConnected: true,
      fetchLegalMoves: vi.fn(),
      startNewGame: vi.fn(),
      playerColor: 'WHITE',
      resetChessState: vi.fn(),
      hintData: null,
      isHintLoading: false,
      fetchHint: vi.fn(),
      evaluation: { score: 0, type: 'CP' },
    } as any);

    render(
      <MemoryRouter initialEntries={['/menu']}>
        <App />
      </MemoryRouter>
    );

    // Act
    const moveBtn = await screen.findByRole('button', { name: /trigger internal move/i });
    fireEvent.click(moveBtn);

    // Assert
    await waitFor(() => {
      expect(mockMakeMove).toHaveBeenCalledWith('room-live-42', 0, 1, 0, 3, 'QUEEN');
    });
  });
});
