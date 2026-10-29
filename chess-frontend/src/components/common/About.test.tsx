import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import About from './About';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('About Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders developer intro, journey timeline and navigates back', () => {
    // Arrange & Act
    render(<About />);

    // Assert
    expect(screen.getByText(/hi, i'm batuhan baysal/i)).toBeDefined();
    expect(screen.getByText(/projects & experience/i)).toBeDefined();
    expect(screen.getByText(/chess platform — real-time multiplayer ecosystem/i)).toBeDefined();

    // Act
    fireEvent.click(screen.getByRole('button', { name: /back to menu/i }));

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('switches carousel image when carousel indicator is clicked', () => {
    // Arrange
    render(<About />);
    const indicators = screen.getAllByLabelText(/go to slide/i);

    // Act
    fireEvent.click(indicators[1]);

    // Assert
    expect(screen.getByText(/dynamic range & power/i)).toBeDefined();
  });

  it('advances carousel slide automatically on timer interval', () => {
    // Arrange
    render(<About />);

    // Act
    act(() => {
      vi.advanceTimersByTime(12500);
    });

    // Assert
    expect(screen.getByText(/dynamic range & power/i)).toBeDefined();
  });

  it('navigates to contact page on CTA button click', () => {
    // Arrange
    render(<About />);
    const ctaButton = screen.getByRole('button', { name: /get in touch/i });

    // Act
    fireEvent.click(ctaButton);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/contact');
  });
});
