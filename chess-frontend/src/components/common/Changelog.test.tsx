import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Changelog from './Changelog';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Changelog Component', () => {
  it('renders latest release by default and handles back navigation', () => {
    // Arrange & Act
    render(<Changelog />);

    // Assert
    expect(screen.getByRole('heading', { name: /changelog & releases/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /v2\.6\.0/i })).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /phase 25: final polish/i })
    ).toBeDefined();

    // Act
    fireEvent.click(screen.getByRole('button', { name: /back to menu/i }));

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('switches active version details when clicking another release in the list', () => {
    // Arrange
    render(<Changelog />);
    const v25Button = screen.getByRole('button', { name: /v2\.5\.0/i });

    // Act
    fireEvent.click(v25Button);

    // Assert
    expect(screen.getByRole('heading', { level: 2, name: /v2\.5\.0/i })).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /phase 24: quality assurance & integration testing/i })
    ).toBeDefined();
  });
});
