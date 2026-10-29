import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GameSetupPanel from './GameSetupPanel';

describe('GameSetupPanel Component', () => {
  const baseProps = {
    selectedTime: 10 as const,
    setSelectedTime: vi.fn(),
    selectedTheme: 'classic' as const,
    setSelectedTheme: vi.fn(),
    isCreating: false,
    onCreateRoom: vi.fn(),
    onOpenAiModal: vi.fn(),
  };

  it('renders time controls and triggers setSelectedTime on click', () => {
    // Arrange
    render(<GameSetupPanel {...baseProps} />);

    // Assert
    expect(screen.getByText(/time control/i)).toBeDefined();

    // Act
    const threeMinBtn = screen.getByRole('button', { name: /select 3 minutes/i });
    fireEvent.click(threeMinBtn);

    // Assert
    expect(baseProps.setSelectedTime).toHaveBeenCalledWith(3);
  });

  it('renders board theme buttons and triggers setSelectedTheme on click', () => {
    // Arrange
    render(<GameSetupPanel {...baseProps} />);

    // Assert
    expect(screen.getByText(/board theme/i)).toBeDefined();

    // Act
    const emeraldThemeBtn = screen.getByRole('button', { name: /lobby theme emerald/i });
    fireEvent.click(emeraldThemeBtn);

    // Assert
    expect(baseProps.setSelectedTheme).toHaveBeenCalledWith('emerald');
  });

  it('calls onCreateRoom when Find Match (Online) button is clicked', () => {
    // Arrange
    render(<GameSetupPanel {...baseProps} />);

    // Act
    const onlineBtn = screen.getByRole('button', { name: /find match \(online\)/i });
    fireEvent.click(onlineBtn);

    // Assert
    expect(baseProps.onCreateRoom).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenAiModal when Play vs Computer button is clicked', () => {
    // Arrange
    render(<GameSetupPanel {...baseProps} />);

    // Act
    const aiBtn = screen.getByRole('button', { name: /play vs computer/i });
    fireEvent.click(aiBtn);

    // Assert
    expect(baseProps.onOpenAiModal).toHaveBeenCalledTimes(1);
  });

  it('disables online matchmaking button while creating room', () => {
    // Arrange
    render(<GameSetupPanel {...baseProps} isCreating={true} />);

    // Act
    const onlineBtn = screen.getByRole('button', { name: /find match \(online\)/i }) as HTMLButtonElement;

    // Assert
    expect(onlineBtn.disabled).toBe(true);
  });
});
