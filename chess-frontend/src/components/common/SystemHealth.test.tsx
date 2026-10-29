import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemHealth from './SystemHealth';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('SystemHealth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders health telemetry cards when actuator returns UP', async () => {
    // Arrange
    const mockHealthResponse = {
      status: 'UP',
      components: {
        db: { status: 'UP' },
        redis: { status: 'UP' },
      },
    };

    window.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockHealthResponse,
    });

    // Act
    render(<SystemHealth />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/system health status/i)).toBeDefined();
      expect(screen.getAllByText('UP').length).toBeGreaterThan(0);
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /back to menu/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders error notice when health endpoint fails or returns error', async () => {
    // Arrange
    window.fetch = vi.fn().mockRejectedValueOnce(new Error('Connection refused'));

    // Act
    render(<SystemHealth />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/system unreachable/i)).toBeDefined();
      expect(screen.getByText(/connection refused/i)).toBeDefined();
    });
  });
});
