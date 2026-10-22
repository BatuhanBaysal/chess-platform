import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';
import * as AuthHook from '../../hooks/useAuth';
import * as ThemeHook from '../../hooks/useTheme';

const renderHeader = (props: { isInGame?: boolean; activeGameId?: string; onBackToMenu?: () => void } = {}) => {
  return render(
    <BrowserRouter>
      <Header {...props} />
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  const mockLogout = vi.fn();
  const mockToggleTheme = vi.fn();
  const mockUpdateUser = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(ThemeHook, 'useTheme').mockReturnValue({
      colorMode: 'dark',
      setColorMode: vi.fn(),
      toggleTheme: mockToggleTheme,
    });
  });

  describe('Anonymous & Role-based Navigation', () => {
    it('renders sign in and sign up links for anonymous users on non-game views', () => {
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

      // Act
      renderHeader();

      // Assert
      expect(screen.getByRole('link', { name: /^sign in$/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /^sign up$/i })).toBeDefined();
      expect(screen.getByText(/chess/i)).toBeDefined();
    });

    it('renders user initial avatar badge and logout button when user is authenticated', () => {
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

      // Act
      renderHeader();

      // Assert
      expect(screen.getByText('B')).toBeDefined();
      expect(screen.getByText('batuhan')).toBeDefined();
      expect(screen.getByTitle(/sign out/i)).toBeDefined();
    });

    it('renders avatar image with dynamic endpoint and cache-busting timestamp', () => {
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

      // Act
      renderHeader();

      // Assert
      const avatarImg = screen.getByRole('img', { name: 'batuhan' }) as HTMLImageElement;
      expect(avatarImg).toBeDefined();
      expect(avatarImg.src).toContain('/api/users/batuhan/avatar?t=');
    });

    it('hides avatar image on error and falls back to user initial', () => {
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
      const avatarImg = screen.getByRole('img', { name: 'batuhan' }) as HTMLImageElement;

      // Act
      fireEvent.error(avatarImg);

      // Assert
      expect(avatarImg.style.display).toBe('none');
      expect(screen.getByText('B')).toBeDefined();
    });

    it('updates avatar image timestamp when avatarUpdated event is dispatched', () => {
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
    });

    it('renders guest initial badge without avatar image request when role is GUEST', () => {
      // Arrange
      vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
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
      expect(screen.getByText('G')).toBeDefined();
      expect(screen.getByText('guest_123')).toBeDefined();
      expect(screen.queryByRole('img', { name: 'guest_123' })).toBeNull();
    });

    it('shows admin navigation tab only when user has ROLE_ADMIN', () => {
      // Arrange
      vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
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
      expect(screen.getByRole('link', { name: /admin/i })).toBeDefined();
    });
  });

  describe('In-Game Context & Two-Step Resign Flow', () => {
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
      expect(screen.getByText(/live match session/i)).toBeDefined();
      expect(screen.queryByRole('link', { name: /about/i })).toBeNull();
      expect(screen.queryByRole('link', { name: /contact/i })).toBeNull();
    });

    it('requires confirmation on first click and resets if not confirmed within 3 seconds', () => {
      // Arrange
      renderHeader({ isInGame: true, activeGameId: 'match-123' });
      const resignButton = screen.getByRole('button', { name: /resign/i });

      // Act
      fireEvent.click(resignButton);

      // Assert
      expect(screen.getByText(/confirm resign\?/i)).toBeDefined();

      // Act
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // Assert
      expect(screen.getByText(/^resign$/i)).toBeDefined();
    });
  });
});
