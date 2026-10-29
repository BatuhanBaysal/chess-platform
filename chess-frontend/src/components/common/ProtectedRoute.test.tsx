import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as AuthHook from '../../hooks/useAuth';

const renderProtectedRoute = (initialRoute = '/', requiredRole?: string) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/sign-in" element={<div>Sign In Page</div>} />
        <Route element={<ProtectedRoute requiredRole={requiredRole} />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    // Arrange
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state when authentication is loading', () => {
    // Arrange
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: null,
      loading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginAsGuest: vi.fn(),
      updateUser: vi.fn(),
    });

    // Act
    renderProtectedRoute('/protected');

    // Assert
    const loadingText = screen.getByText(/loading security context/i);
    expect(loadingText).toBeDefined();
  });

  it('redirects to sign-in when token or user is missing', () => {
    // Arrange
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginAsGuest: vi.fn(),
      updateUser: vi.fn(),
    });

    // Act
    renderProtectedRoute('/protected');

    // Assert
    const signInPage = screen.getByText(/sign in page/i);
    expect(signInPage).toBeDefined();
  });

  it('redirects to sign-in when user role does not match required role', () => {
    // Arrange
    localStorage.setItem('token', 'fake-jwt-token');
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 1, username: 'player', role: 'ROLE_USER' } as any,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginAsGuest: vi.fn(),
      updateUser: vi.fn(),
    });

    // Act
    renderProtectedRoute('/protected', 'ROLE_ADMIN');

    // Assert
    expect(screen.getByText(/sign in page/i)).toBeDefined();
    expect(screen.queryByText(/protected content/i)).toBeNull();
  });

  it('renders outlet when user is authenticated and authorized', () => {
    // Arrange
    localStorage.setItem('token', 'fake-jwt-token');
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginAsGuest: vi.fn(),
      updateUser: vi.fn(),
    });

    // Act
    renderProtectedRoute('/protected');

    // Assert
    const protectedContent = screen.getByText(/protected content/i);
    expect(protectedContent).toBeDefined();
  });
});
