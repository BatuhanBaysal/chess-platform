import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';
import * as AuthHook from '../../hooks/useAuth';
import * as ThemeHook from '../../hooks/useTheme';
import * as AudioHook from '../../features/chess/hooks/useChessAudio';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderHeader = (props: { isInGame?: boolean; activeGameId?: string; onBackToMenu?: () => void } = {}) => {
  return render(
    <BrowserRouter>
      <Header {...props} />
    </BrowserRouter>
  );
};

describe('Header Component - Comprehensive Tests', () => {
  const mockLogout = vi.fn();
  const mockToggleTheme = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockToggleMute = vi.fn();
  const mockPlayDefeatSound = vi.fn();

  beforeEach(() => {
    // Arrange
    localStorage.clear();
    vi.clearAllMocks();
    vi.useRealTimers();

    vi.spyOn(ThemeHook, 'useTheme').mockReturnValue({
      colorMode: 'dark',
      setColorMode: vi.fn(),
      toggleTheme: mockToggleTheme,
    });

    vi.spyOn(AudioHook, 'useChessAudio').mockReturnValue({
      isMuted: false,
      toggleMute: mockToggleMute,
      playDefeatSound: mockPlayDefeatSound,
      playMoveSound: vi.fn(),
      playCaptureSound: vi.fn(),
      playCheckSound: vi.fn(),
      playVictorySound: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Anonymous & Role-based Navigation', () => {
    it('renders sign in and sign up links for anonymous users on non-game views', () => {
      // Arrange
      const authSpy = vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });

      // Act
      renderHeader();

      // Assert
      const signInLink = screen.getByRole('link', { name: /^sign in$/i });
      const signUpLink = screen.getByRole('link', { name: /^sign up$/i });
      expect(signInLink).toBeDefined();
      expect(signUpLink).toBeDefined();
      expect(authSpy).toHaveBeenCalled();
    });

    it('renders user initial avatar badge and logout button when user is authenticated', () => {
      // Arrange
      const authSpy = vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });

      // Act
      renderHeader();

      // Assert
      const initialBadge = screen.getByText('B');
      const usernameText = screen.getByText('batuhan');
      const signOutBtn = screen.getByTitle(/sign out/i);
      expect(initialBadge).toBeDefined();
      expect(usernameText).toBeDefined();
      expect(signOutBtn).toBeDefined();
      expect(authSpy).toHaveBeenCalled();
    });

    it('renders avatar image with dynamic endpoint and cache-busting timestamp', () => {
      // Arrange
      const authSpy = vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });

      // Act
      renderHeader();

      // Assert
      const avatarImg = screen.getByRole('img', { name: 'batuhan' }) as HTMLImageElement;
      expect(avatarImg).toBeDefined();
      expect(avatarImg.src).toContain('/api/users/batuhan/avatar?t=');
      expect(authSpy).toHaveBeenCalled();
    });

    it('hides avatar image on error and falls back to user initial', () => {
      // Arrange
      const authSpy = vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });
      renderHeader();
      const avatarImg = screen.getByRole('img', { name: 'batuhan' }) as HTMLImageElement;

      // Act
      fireEvent.error(avatarImg);

      // Assert
      expect(avatarImg.style.display).toBe('none');
      expect(screen.getByText('B')).toBeDefined();
      expect(authSpy).toHaveBeenCalled();
    });

    it('updates avatar image timestamp when avatarUpdated event is dispatched', () => {
      // Arrange
      const authSpy = vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });
      renderHeader();
      const initialImg = screen.getByRole('img', { name: 'batuhan' }) as HTMLImageElement;
      const initialSrc = initialImg.src;
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 5000);

      // Act
      act(() => {
        window.dispatchEvent(new Event('avatarUpdated'));
      });

      // Assert
      const updatedImg = screen.getByRole('img', { name: 'batuhan' }) as HTMLImageElement;
      expect(updatedImg.src).not.toBe(initialSrc);
      expect(authSpy).toHaveBeenCalled();
    });

    it('renders guest initial badge without avatar image request when role is GUEST', () => {
      // Arrange
      const authSpy = vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 99, username: 'guest_123', role: 'ROLE_GUEST' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });

      // Act
      renderHeader();

      // Assert
      const guestInitial = screen.getByText('G');
      const guestName = screen.getByText('guest_123');
      const guestImg = screen.queryByRole('img', { name: 'guest_123' });
      expect(guestInitial).toBeDefined();
      expect(guestName).toBeDefined();
      expect(guestImg).toBeNull();
      expect(authSpy).toHaveBeenCalled();
    });

    it('shows admin navigation tab only when user has ROLE_ADMIN', () => {
      // Arrange
      const authSpy = vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 2, username: 'adminUser', role: 'ROLE_ADMIN' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });

      // Act
      renderHeader();

      // Assert
      const adminLink = screen.getByRole('link', { name: /admin/i });
      expect(adminLink).toBeDefined();
      expect(authSpy).toHaveBeenCalled();
    });

    it('resolves username and role from localStorage when user object is incomplete', () => {
      // Arrange
      localStorage.setItem('username', 'storageUser');
      localStorage.setItem('role', 'ROLE_USER');
      const authSpy = vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 3, role: 'ROLE_USER' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });

      // Act
      renderHeader();

      // Assert
      const storageUserText = screen.getByText('storageUser');
      expect(storageUserText).toBeDefined();
      expect(authSpy).toHaveBeenCalled();
    });
  });

  describe('Theme, Logout and General Interactions', () => {
    beforeEach(() => {
      vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });
    });

    it('calls toggleTheme when theme button is clicked', () => {
      // Arrange
      renderHeader();
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });

      // Act
      fireEvent.click(themeButton);

      // Assert
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('calls logout when sign out button is clicked', () => {
      // Arrange
      renderHeader();
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      // Act
      fireEvent.click(signOutButton);

      // Assert
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('navigates to menu when logo is clicked on non-game view', () => {
      // Arrange
      const mockOnBackToMenu = vi.fn();
      renderHeader({ onBackToMenu: mockOnBackToMenu });
      const logoButton = screen.getByTitle(/chess platform home/i);

      // Act
      fireEvent.click(logoButton);

      // Assert
      expect(mockOnBackToMenu).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('In-Game Context & Two-Step Resign Flow', () => {
    const mockOnBackToMenu = vi.fn();

    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'player', role: 'ROLE_USER' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });
    });

    it('renders live session badge and hides navigation links while in game', () => {
      // Arrange & Act
      renderHeader({ isInGame: true, activeGameId: 'match-123' });

      // Assert
      const sessionBadge = screen.getByText(/live match session/i);
      const aboutLink = screen.queryByRole('link', { name: /about/i });
      const contactLink = screen.queryByRole('link', { name: /contact/i });
      expect(sessionBadge).toBeDefined();
      expect(aboutLink).toBeNull();
      expect(contactLink).toBeNull();
    });

    it('toggles audio mute when mute button is clicked in game', () => {
      // Arrange
      renderHeader({ isInGame: true, activeGameId: 'match-123' });
      const muteButton = screen.getByRole('button', { name: /toggle sound/i });

      // Act
      fireEvent.click(muteButton);

      // Assert
      expect(mockToggleMute).toHaveBeenCalledTimes(1);
    });

    it('requires confirmation on first click and resets if not confirmed within 3 seconds', () => {
      // Arrange
      renderHeader({ isInGame: true, activeGameId: 'match-123' });
      const resignButton = screen.getByRole('button', { name: /resign/i });

      // Act
      fireEvent.click(resignButton);
      const confirmText = screen.getByText(/confirm resign\?/i);
      expect(confirmText).toBeDefined();

      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // Assert
      const resetResignButton = screen.getByText(/^resign$/i);
      expect(resetResignButton).toBeDefined();
    });

    it('executes full resign flow on second click, clearing session and navigating', () => {
      // Arrange
      renderHeader({ isInGame: true, activeGameId: 'match-123', onBackToMenu: mockOnBackToMenu });
      const resignButton = screen.getByRole('button', { name: /resign/i });

      // Act
      fireEvent.click(resignButton);
      expect(screen.getByText(/confirm resign\?/i)).toBeDefined();

      fireEvent.click(resignButton);

      // Assert
      expect(localStorage.getItem('just_resigned')).toBe('true');
      expect(mockPlayDefeatSound).toHaveBeenCalledTimes(1);
      expect(mockOnBackToMenu).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Mobile Drawer Interactions', () => {
    it('opens and closes mobile menu drawer correctly', () => {
      // Arrange
      const authSpy = vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });
      renderHeader();
      const drawerToggleButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      
      // Act
      fireEvent.click(drawerToggleButton);
      const closeMenuButton = screen.getByRole('button', { name: /close mobile navigation menu/i });
      expect(closeMenuButton).toBeDefined();

      fireEvent.click(closeMenuButton);

      // Assert
      const missingCloseButton = screen.queryByRole('button', { name: /close mobile navigation menu/i });
      expect(missingCloseButton).toBeNull();
      expect(authSpy).toHaveBeenCalled();
    });

    it('handles mobile drawer navigation link clicks and sign out action', () => {
      // Arrange
      vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });
      renderHeader();
      const drawerToggleButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      // Act
      fireEvent.click(drawerToggleButton);

      // Assert
      const mobileSignOutBtn = screen.getAllByRole('button', { name: /sign out/i });
      expect(mobileSignOutBtn.length).toBeGreaterThan(0);

      // Act
      fireEvent.click(mobileSignOutBtn[mobileSignOutBtn.length - 1]);

      // Assert
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('renders mobile guest sign in and sign up links for unauthenticated users', () => {
      // Arrange
      vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
        user: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loginAsGuest: vi.fn(),
        updateUser: mockUpdateUser,
        loading: false,
      });
      renderHeader();
      const drawerToggleButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      // Act
      fireEvent.click(drawerToggleButton);

      // Assert
      const signInLinks = screen.getAllByRole('link', { name: /^sign in$/i });
      expect(signInLinks.length).toBeGreaterThan(1);

      // Act
      fireEvent.click(signInLinks[signInLinks.length - 1]);

      // Assert
      expect(screen.queryByRole('button', { name: /close mobile navigation menu/i })).toBeNull();
    });
  });
});
