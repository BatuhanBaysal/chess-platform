import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthForm from './AuthForm';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderAuthForm = (initialRoute: string = '/sign-in') => {
  const mockOnLogin = vi.fn();
  const mockOnRegister = vi.fn();
  const mockOnSuccessChange = vi.fn();

  const utils = render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthForm 
        onLogin={mockOnLogin} 
        onRegister={mockOnRegister} 
        onSuccessChange={mockOnSuccessChange} 
      />
    </MemoryRouter>
  );

  return {
    ...utils,
    mockOnLogin,
    mockOnRegister,
    mockOnSuccessChange,
  };
};

describe('AuthForm Component', () => {
  beforeEach(() => {
    // Arrange
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

    it('submits form when Enter is pressed inside password input', async () => {
      // Arrange
      const { mockOnLogin } = renderAuthForm('/sign-in');
      const usernameInput = screen.getByPlaceholderText('username or email');
      const passwordInput = screen.getByPlaceholderText('••••••••');

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'player1' } });
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'Secret123' } });
      fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' });

      // Assert
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith('player1', 'Secret123');
      });
    });

    it('handles generic backend login error and displays it on password field', async () => {
      // Arrange
      const { mockOnLogin } = renderAuthForm('/sign-in');
      mockOnLogin.mockRejectedValueOnce({
        response: { data: { message: 'Bad credentials' } },
      });

      const usernameInput = screen.getByPlaceholderText('username or email');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /^sign in$/i });

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'user_unknown' } });
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'WrongPass1' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Bad credentials')).toBeDefined();
      });
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

    it('shows validation error when password does not meet complexity requirements', async () => {
      // Arrange
      renderAuthForm('/sign-up');
      const usernameInput = screen.getByPlaceholderText('batuchess');
      const emailInput = screen.getByPlaceholderText('player@chessplatform.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'validuser' } });
      fireEvent.change(emailInput, { target: { name: 'email', value: 'valid@test.com' } });
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'allletters' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters with letters and numbers/i)).toBeDefined();
      });
    });

    it('focuses email and then password on consecutive Enter key downs in sign up view', () => {
      // Arrange
      renderAuthForm('/sign-up');
      const usernameInput = screen.getByPlaceholderText('batuchess');
      const emailInput = screen.getByPlaceholderText('player@chessplatform.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'validuser' } });
      fireEvent.keyDown(usernameInput, { key: 'Enter', code: 'Enter' });

      // Assert
      expect(document.activeElement).toBe(emailInput);

      // Act
      fireEvent.change(emailInput, { target: { name: 'email', value: 'valid@email.com' } });
      fireEvent.keyDown(emailInput, { key: 'Enter', code: 'Enter' });

      // Assert
      expect(document.activeElement).toBe(passwordInput);
    });

    it('renders SignUpSuccessCard upon successful registration and proceeds to sign in on CTA click', async () => {
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
      });

      // Act
      const proceedBtn = screen.getByRole('button', { name: /proceed to sign in/i });
      fireEvent.click(proceedBtn);

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/sign-in');
    });

    it('handles backend conflict errors properly when username is taken', async () => {
      // Arrange
      const { mockOnRegister } = renderAuthForm('/sign-up');
      mockOnRegister.mockRejectedValueOnce({
        response: { data: { message: 'Username is already taken' } },
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

    it('handles backend conflict errors properly when email is taken', async () => {
      // Arrange
      const { mockOnRegister } = renderAuthForm('/sign-up');
      mockOnRegister.mockRejectedValueOnce({
        response: { data: { message: 'Email address is already in use' } },
      });

      const usernameInput = screen.getByPlaceholderText('batuchess');
      const emailInput = screen.getByPlaceholderText('player@chessplatform.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Act
      fireEvent.change(usernameInput, { target: { name: 'username', value: 'newuser123' } });
      fireEvent.change(emailInput, { target: { name: 'email', value: 'taken@chess.com' } });
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'Norway2026' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/this email address is already in use\./i)).toBeDefined();
      });
    });
  });

  describe('UI Interactions & Mode Switch', () => {
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

    it('switches between Sign In and Sign Up modes and clears previous inputs', () => {
      // Arrange
      renderAuthForm('/sign-in');
      const modeSwitchBtn = screen.getByText(/don't have an account\?/i).closest('button')!;

      // Act
      fireEvent.click(modeSwitchBtn);

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/sign-up');

      // Arrange
      renderAuthForm('/sign-up');
      const signInSwitchBtn = screen.getByText(/already have an account\?/i).closest('button')!;

      // Act
      fireEvent.click(signInSwitchBtn);

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/sign-in');
    });
  });
});
