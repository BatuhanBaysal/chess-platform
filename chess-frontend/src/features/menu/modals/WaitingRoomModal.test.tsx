import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WaitingRoomModal } from './WaitingRoomModal';

describe('WaitingRoomModal', () => {
  const defaultProps = {
    waitingRoomId: 'ROOM-1234',
    selectedTime: 10,
    selectedTheme: 'modern',
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  it('should not render anything when waitingRoomId is null', () => {
    // Arrange
    const props = { ...defaultProps, waitingRoomId: null };

    // Act
    const { container } = render(<WaitingRoomModal {...props} />);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('should render modal content, room ID, and match telemetry when waitingRoomId is provided', () => {
    // Arrange
    const props = { ...defaultProps };

    // Act
    render(<WaitingRoomModal {...props} />);

    // Assert
    expect(screen.getByRole('heading', { name: /SEARCHING OPPONENT/i })).toBeDefined();
    expect(screen.getByText(/ROOM-1234/i)).toBeDefined();
    expect(screen.getByText(/RATED MATCH • DYNAMIC ELO/i)).toBeDefined();
    expect(screen.getByText(/10 MIN/i)).toBeDefined();
    expect(screen.getByText(/MODERN/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /CANCEL DEPLOYMENT/i })).toBeDefined();
  });

  it('should lock document body and html scroll when mounted and restore on unmount', () => {
    // Arrange
    const props = { ...defaultProps };

    // Act
    const { unmount } = render(<WaitingRoomModal {...props} />);

    // Assert
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    // Act
    unmount();

    // Assert
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('should trigger onCancel when clicking the Cancel Deployment button', () => {
    // Arrange
    render(<WaitingRoomModal {...defaultProps} />);
    const cancelBtn = screen.getByRole('button', { name: /CANCEL DEPLOYMENT/i });

    // Act
    fireEvent.click(cancelBtn);

    // Assert
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should trigger onCancel when pressing the Escape key', () => {
    // Arrange
    render(<WaitingRoomModal {...defaultProps} />);

    // Act
    fireEvent.keyDown(window, { key: 'Escape' });

    // Assert
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
