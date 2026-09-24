import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthForm from './AuthForm';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AuthForm Component', () => {
  const mockOnLogin = vi.fn();
  const mockOnRegister = vi.fn();
  const mockOnGuestLogin = vi.fn();

  it('renders login form by default and shows validation errors on empty submit', async () => {
    // Arrange
    renderWithRouter(
      <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} onGuestLogin={mockOnGuestLogin} />
    );

    // Assert
    expect(screen.getByRole('heading', { name: /login/i })).toBeDefined();

    // Act
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/username or email is required/i)).toBeDefined();
      expect(screen.getByText(/password is required/i)).toBeDefined();
    });

    // Assert
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('calls onGuestLogin when guest button is clicked', () => {
    // Arrange
    renderWithRouter(
      <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} onGuestLogin={mockOnGuestLogin} />
    );

    // Act
    const guestButton = screen.getByRole('button', { name: /play as guest/i });
    fireEvent.click(guestButton);

    // Assert
    expect(mockOnGuestLogin).toHaveBeenCalledTimes(1);
  });

  it('toggles password visibility when the eye button is clicked', () => {
    // Arrange
    renderWithRouter(
      <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} onGuestLogin={mockOnGuestLogin} />
    );

    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    
    // Assert
    expect(passwordInput.type).toBe('password');

    // Act
    const toggleButton = screen.getByRole('button', { name: '👁️' });
    fireEvent.click(toggleButton);

    // Assert
    expect(passwordInput.type).toBe('text');
  });
});
