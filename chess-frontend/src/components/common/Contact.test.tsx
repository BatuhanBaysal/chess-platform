import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contact from './Contact';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Contact Component', () => {
  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    window.open = vi.fn();
  });

  it('renders contact headings and handles back navigation', () => {
    // Arrange & Act
    render(<Contact />);

    // Assert
    expect(screen.getByText(/contact & collaboration/i)).toBeDefined();

    // Act
    fireEvent.click(screen.getByRole('button', { name: /back to menu/i }));

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('copies email to clipboard and displays copied badge', async () => {
    // Arrange
    render(<Contact />);
    const copyButton = screen.getByRole('button', { name: /email dispatch/i });

    // Act
    fireEvent.click(copyButton);

    // Assert
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('batuhanbaysal3@gmail.com');
    await waitFor(() => {
      expect(screen.getByText(/copied!/i)).toBeDefined();
    });
  });

  it('handles clipboard failure gracefully when copying email rejects', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    navigator.clipboard.writeText = vi.fn().mockRejectedValueOnce(new Error('Clipboard blocked'));
    render(<Contact />);
    const copyButton = screen.getByRole('button', { name: /email dispatch/i });

    // Act
    fireEvent.click(copyButton);

    // Assert
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to copy email:', expect.any(Error));
    });
  });

  it('submits contact form and opens default mail client', async () => {
    // Arrange
    render(<Contact />);
    const nameInput = screen.getByLabelText(/your name/i);
    const emailInput = screen.getByLabelText(/your email address/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitBtn = screen.getByRole('button', { name: /dispatch message/i });

    // Act
    fireEvent.change(nameInput, { target: { value: 'Tech Recruiter' } });
    fireEvent.change(emailInput, { target: { value: 'recruiter@tech.com' } });
    fireEvent.change(messageInput, { target: { value: 'We are impressed with your chess platform.' } });
    fireEvent.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('mailto:batuhanbaysal3@gmail.com'),
        '_blank'
      );
      expect(screen.getByText(/opening default mail application/i)).toBeDefined();
    });
  });
});
