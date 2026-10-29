import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardHeroBanner from './DashboardHeroBanner';

describe('DashboardHeroBanner Component', () => {
  const baseProps = {
    username: 'batuhan',
    eloRating: 1450,
    totalGames: 25,
    onQuickMatch: vi.fn(),
    isCreating: false,
  };

  it('renders welcome back greeting and formatted ELO rating', () => {
    // Arrange & Act
    render(<DashboardHeroBanner {...baseProps} />);

    // Assert
    expect(screen.getByText(/welcome back, batuhan/i)).toBeDefined();
    expect(screen.getByText('1450 ELO')).toBeDefined();
    expect(screen.getByText(/ranked season/i)).toBeDefined();
  });

  it('renders guest greeting title when username starts with guest_', () => {
    // Arrange
    const guestProps = { ...baseProps, username: 'guest_9876' };

    // Act
    render(<DashboardHeroBanner {...guestProps} />);

    // Assert
    expect(screen.getByText(/welcome, guest_9876/i)).toBeDefined();
  });

  it('renders initial welcome message for new player with zero games', () => {
    // Arrange
    const newPlayerProps = { ...baseProps, totalGames: 0 };

    // Act
    render(<DashboardHeroBanner {...newPlayerProps} />);

    // Assert
    expect(screen.getByText(/welcome to chess platform, batuhan/i)).toBeDefined();
  });

  it('renders fallback 1200 ELO when eloRating is missing', () => {
    // Arrange
    const unratedProps = { ...baseProps, eloRating: null };

    // Act
    render(<DashboardHeroBanner {...unratedProps} />);

    // Assert
    expect(screen.getByText('1200 ELO')).toBeDefined();
  });

  it('handles environment fallback when crypto.getRandomValues is undefined', () => {
    // Arrange
    const originalCrypto = window.crypto;
    Object.defineProperty(window, 'crypto', {
      writable: true,
      value: undefined,
    });

    // Act
    render(<DashboardHeroBanner {...baseProps} />);

    // Assert
    expect(screen.getByText(/batuhan/i)).toBeDefined();
    
    Object.defineProperty(window, 'crypto', {
      writable: true,
      value: originalCrypto,
    });
  });

  it('triggers onQuickMatch when Quick Match button is clicked', () => {
    // Arrange
    render(<DashboardHeroBanner {...baseProps} />);

    // Act
    const quickMatchBtn = screen.getByRole('button', { name: /quick match/i });
    fireEvent.click(quickMatchBtn);

    // Assert
    expect(baseProps.onQuickMatch).toHaveBeenCalledTimes(1);
  });

  it('disables Quick Match button while match creation is in progress', () => {
    // Arrange
    render(<DashboardHeroBanner {...baseProps} isCreating={true} />);

    // Act
    const quickMatchBtn = screen.getByRole('button', { name: /quick match/i }) as HTMLButtonElement;

    // Assert
    expect(quickMatchBtn.disabled).toBe(true);
  });
});
