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
