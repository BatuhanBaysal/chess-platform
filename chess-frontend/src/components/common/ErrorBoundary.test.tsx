import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test crash');
};

describe('ErrorBoundary Component', () => {
  const originalConsoleError = console.error;
  const originalLocation = window.location;

  beforeEach(() => {
    // Arrange
    console.error = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, reload: vi.fn() },
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
  });

  it('renders children correctly when no error occurs', () => {
    // Arrange & Act
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>
    );

    // Assert
    expect(screen.getByText('Safe Content')).toBeDefined();
  });

  it('renders fallback UI when an error is caught', () => {
    // Arrange & Act
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Assert
    const errorHeading = screen.getByText(/something went wrong/i);
    const reloadButton = screen.getByRole('button', { name: /reload application/i });
    expect(errorHeading).toBeDefined();
    expect(reloadButton).toBeDefined();
  });

  it('renders custom fallback UI when fallback prop is supplied', () => {
    // Arrange & Act
    render(
      <ErrorBoundary fallback={<div>Custom Error Boundary Fallback</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    // Assert
    expect(screen.getByText('Custom Error Boundary Fallback')).toBeDefined();
  });

  it('calls window.location.reload when reload application button is clicked', () => {
    // Arrange
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const reloadButton = screen.getByRole('button', { name: /reload application/i });

    // Act
    fireEvent.click(reloadButton);

    // Assert
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
