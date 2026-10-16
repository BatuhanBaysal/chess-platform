import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiMatchModal } from './AiMatchModal';
import type { TimeControl } from '../hooks/useLobby';

describe('AiMatchModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    selectedTime: 10 as TimeControl,
    setSelectedTime: vi.fn(),
    selectedTheme: 'classic',
    setSelectedTheme: vi.fn(),
    aiPlayAsWhite: true,
    setAiPlayAsWhite: vi.fn(),
    aiDifficulty: 3,
    setAiDifficulty: vi.fn(),
    onStartMatch: vi.fn(),
    isAiLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  it('should not render anything when isOpen is false', () => {
    // Arrange
    const props = { ...defaultProps, isOpen: false };

    // Act
    const { container } = render(<AiMatchModal {...props} />);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('should render modal content and unrated telemetry notice when isOpen is true', () => {
    // Arrange
    const props = { ...defaultProps };

    // Act
    render(<AiMatchModal {...props} />);

    // Assert
    expect(screen.getByRole('heading', { name: /CONFIGURE AI MATCH/i })).toBeDefined();
    expect(screen.getByText(/CASUAL MATCH • UNRATED/i)).toBeDefined();
    expect(screen.getByText(/This match does not affect your ELO rating/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /START MATCH/i })).toBeDefined();
  });

  it('should lock document body and html scroll when opened and restore them on unmount', () => {
    // Arrange
    const props = { ...defaultProps };

    // Act
    const { unmount } = render(<AiMatchModal {...props} />);

    // Assert
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    // Act
    unmount();

    // Assert
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('should trigger onClose when clicking the close button', () => {
    // Arrange
    render(<AiMatchModal {...defaultProps} />);
    const closeBtn = screen.getByTitle(/Close \(ESC\)/i);

    // Act
    fireEvent.click(closeBtn);

    // Assert
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should trigger onClose when clicking the Cancel button', () => {
    // Arrange
    render(<AiMatchModal {...defaultProps} />);
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });

    // Act
    fireEvent.click(cancelBtn);

    // Assert
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should trigger onClose when pressing the Escape key', () => {
    // Arrange
    render(<AiMatchModal {...defaultProps} />);

    // Act
    fireEvent.keyDown(window, { key: 'Escape' });

    // Assert
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call setSelectedTime with selected minutes when a time option is clicked', () => {
    // Arrange
    render(<AiMatchModal {...defaultProps} />);
    const threeMinBtn = screen.getByRole('button', { name: /^3 MIN$/i });

    // Act
    fireEvent.click(threeMinBtn);

    // Assert
    expect(defaultProps.setSelectedTime).toHaveBeenCalledWith(3);
  });

  it('should call setAiPlayAsWhite with false when selecting Black side', () => {
    // Arrange
    render(<AiMatchModal {...defaultProps} />);
    const blackSideBtn = screen.getByRole('button', { name: /Black \(AI First\)/i });

    // Act
    fireEvent.click(blackSideBtn);

    // Assert
    expect(defaultProps.setAiPlayAsWhite).toHaveBeenCalledWith(false);
  });

  it('should call setAiDifficulty when clicking a difficulty level button', () => {
    // Arrange
    render(<AiMatchModal {...defaultProps} />);
    const level5Btn = screen.getByRole('button', { name: /^Level 5$/i });

    // Act
    fireEvent.click(level5Btn);

    // Assert
    expect(defaultProps.setAiDifficulty).toHaveBeenCalledWith(5);
  });

  it('should call onStartMatch when clicking the Start Match button', () => {
    // Arrange
    render(<AiMatchModal {...defaultProps} />);
    const startMatchBtn = screen.getByRole('button', { name: /START MATCH/i });

    // Act
    fireEvent.click(startMatchBtn);

    // Assert
    expect(defaultProps.onStartMatch).toHaveBeenCalledTimes(1);
  });

  it('should disable Start Match button when isAiLoading is true', () => {
    // Arrange
    const props = { ...defaultProps, isAiLoading: true };

    // Act
    render(<AiMatchModal {...props} />);
    const startMatchBtn = screen.getByRole('button', { name: /START MATCH/i }) as HTMLButtonElement;

    // Assert
    expect(startMatchBtn.disabled).toBe(true);
  });
});
