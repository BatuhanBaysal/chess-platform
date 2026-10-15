import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthForm from './AuthForm';

const renderAuthForm = (initialRoute: string = '/sign-in') => {
  const mockOnLogin = vi.fn();
  const mockOnRegister = vi.fn();

  const utils = render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
    </MemoryRouter>
  );

  return {
    ...utils,
    mockOnLogin,
    mockOnRegister,
  };
};

describe('AuthForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sign In View', () => {
    it('renders sign in fields and displays validation errors on empty submit', async () => {
      // Arrange
      const { mockOnLogin } = renderAuthForm('/sign-in');

      // Assert
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeDefined();

      // Act
      const submitButton = screen.getByRole('button', { name: /^sign in$/i });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/username or email is required/i)).toBeDefined();
        expect(screen.getByText(/password is required/i)).toBeDefined();
      });
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('submits successfully when credentials are valid', async () => {
      // Arrange
      const { mockOnLogin } = renderAuthForm('/sign-in');
      const usernameInput = screen.getByPlaceholderText('username or email');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /^sign in$/i });

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'grandmaster' } });
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'Secret123' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledTimes(1);
        expect(mockOnLogin).toHaveBeenCalledWith('grandmaster', 'Secret123');
      });
    });

    it('focuses password field on Enter press when username is filled', () => {
      // Arrange
      renderAuthForm('/sign-in');
      const usernameInput = screen.getByPlaceholderText('username or email');
      const passwordInput = screen.getByPlaceholderText('••••••••');

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'player1' } });
      fireEvent.keyDown(usernameInput, { key: 'Enter', code: 'Enter' });

      // Assert
      expect(document.activeElement).toBe(passwordInput);
    });
  });

  describe('Sign Up View & Field Validations', () => {
    it('renders all registration fields and hints on sign up route', () => {
      // Arrange
      renderAuthForm('/sign-up');

      // Assert
      expect(screen.getByRole('heading', { name: /sign up/i })).toBeDefined();
      expect(screen.getByPlaceholderText('batuchess')).toBeDefined();
      expect(screen.getByPlaceholderText('player@chessplatform.com')).toBeDefined();
      expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
      expect(screen.getByText(/min 8 characters, including letters & numbers/i)).toBeDefined();
    });

    it('shows field-level error if username length is less than 3 characters', async () => {
      // Arrange
      renderAuthForm('/sign-up');
      const usernameInput = screen.getByPlaceholderText('batuchess');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'ab' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/username must be between 3 and 20 characters/i)).toBeDefined();
      });
    });

    it('shows validation error for invalid email format', async () => {
      // Arrange
      renderAuthForm('/sign-up');
      const usernameInput = screen.getByPlaceholderText('batuchess');
      const emailInput = screen.getByPlaceholderText('player@chessplatform.com');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'validuser' } });
      fireEvent.change(emailInput, { target: { name: 'email', value: 'invalid-email' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeDefined();
      });
    });

    it('blocks Enter navigation to next input when current field fails validation', () => {
      // Arrange
      renderAuthForm('/sign-up');
      const usernameInput = screen.getByPlaceholderText('batuchess');
      const emailInput = screen.getByPlaceholderText('player@chessplatform.com');

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'a' } });
      fireEvent.keyDown(usernameInput, { key: 'Enter', code: 'Enter' });

      // Assert
      expect(document.activeElement).not.toBe(emailInput);
      expect(screen.getByText(/username must be between 3 and 20 characters/i)).toBeDefined();
    });

    it('renders SignUpSuccessCard upon successful registration submission', async () => {
      // Arrange
      const { mockOnRegister } = renderAuthForm('/sign-up');
      mockOnRegister.mockResolvedValueOnce(undefined);

      const usernameInput = screen.getByPlaceholderText('batuchess');
      const emailInput = screen.getByPlaceholderText('player@chessplatform.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'kasparov' } });
      fireEvent.change(emailInput, { target: { name: 'email', value: 'garry@chess.com' } });
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'Password123' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnRegister).toHaveBeenCalledWith('kasparov', 'Password123', 'garry@chess.com');
        expect(screen.getByRole('heading', { name: /welcome, @kasparov!/i })).toBeDefined();
        expect(screen.getByText(/1200 elo/i)).toBeDefined();
      });
    });

    it('handles backend conflict errors properly when username is taken', async () => {
      // Arrange
      const { mockOnRegister } = renderAuthForm('/sign-up');
      mockOnRegister.mockRejectedValueOnce({
        response: { data: { message: 'Username is already taken' } }
      });

      const usernameInput = screen.getByPlaceholderText('batuchess');
      const emailInput = screen.getByPlaceholderText('player@chessplatform.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'carlsen' } });
      fireEvent.change(emailInput, { target: { name: 'email', value: 'magnus@chess.com' } });
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'Norway2026' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/this username is already taken\./i)).toBeDefined();
      });
    });
  });

  describe('UI Interactions & State', () => {
    it('toggles password visibility when the eye button is clicked', () => {
      // Arrange
      renderAuthForm('/sign-in');
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
      const toggleButton = screen.getByTitle(/show password/i);

      // Assert
      expect(passwordInput.type).toBe('password');

      // Act
      fireEvent.click(toggleButton);

      // Assert
      expect(passwordInput.type).toBe('text');
    });

    it('detects and displays warning when Caps Lock is enabled', () => {
      // Arrange
      renderAuthForm('/sign-in');
      const passwordInput = screen.getByPlaceholderText('••••••••');

      // Act
      const event = new KeyboardEvent('keydown', {
        key: 'A',
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'getModifierState', {
        value: (key: string) => key === 'CapsLock',
      });
      fireEvent(passwordInput, event);

      // Assert
      expect(screen.getByText(/caps lock is on/i)).toBeDefined();
    });
  });
});
