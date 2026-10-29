import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthContainer from './AuthContainer';

describe('AuthContainer & AuthShowcase Integration', () => {
  const mockLogin = vi.fn();
  const mockRegister = vi.fn();
  const mockGuestLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderContainer = (route = '/sign-in') => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <AuthContainer
          onLogin={mockLogin}
          onRegister={mockRegister}
          onGuestLogin={mockGuestLogin}
        />
      </MemoryRouter>
    );
  };

  it('renders showcase features and default sign-in background', () => {
    // Arrange & Act
    const { container } = renderContainer('/sign-in');

    // Assert
    expect(screen.getByText(/online multiplayer/i)).toBeDefined();
    expect(screen.getByText(/stockfish ai engine/i)).toBeDefined();
    expect(screen.getByText(/smart hints/i)).toBeDefined();

    const bgDiv = container.querySelector('div[style*="background-image"]');
    expect(bgDiv?.getAttribute('style')).toContain('/assets/images/auth/auth-signin-bg.jpg');
  });

  it('renders sign-up background when route is /sign-up', () => {
    // Arrange & Act
    const { container } = renderContainer('/sign-up');

    // Assert
    const bgDiv = container.querySelector('div[style*="background-image"]');
    expect(bgDiv?.getAttribute('style')).toContain('/assets/images/auth/auth-signup-bg.jpg');
  });

  it('calls onGuestLogin when "Play as Guest Now" button is clicked', async () => {
    // Arrange
    renderContainer('/sign-in');
    const guestBtn = screen.getByRole('button', { name: /play as guest now/i });

    // Act
    fireEvent.click(guestBtn);

    // Assert
    expect(mockGuestLogin).toHaveBeenCalledTimes(1);
  });

  it('switches to welcome background upon successful registration', async () => {
    // Arrange
    mockRegister.mockResolvedValueOnce(undefined);
    const { container } = renderContainer('/sign-up');

    const usernameInput = screen.getByPlaceholderText('batuchess');
    const emailInput = screen.getByPlaceholderText('player@chessplatform.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /create account/i });

    // Act
    fireEvent.change(usernameInput, { target: { name: 'username', value: 'player1' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'player1@test.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'Password123' } });
    fireEvent.click(submitBtn);

    // Assert
    await waitFor(() => {
      const bgDiv = container.querySelector('div[style*="background-image"]');
      expect(bgDiv?.getAttribute('style')).toContain('/assets/images/auth/auth-welcome-bg.jpg');
      expect(screen.getByRole('button', { name: /proceed to sign in/i })).toBeDefined();
    });
  });
});
