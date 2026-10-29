import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';
import * as AuthHook from '../../hooks/useAuth';

describe('Footer Component', () => {
  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      user: { id: 1, username: 'batuhan', role: 'ROLE_USER' } as any,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginAsGuest: vi.fn(),
      updateUser: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders footer details, creator attribution and links on regular pages', async () => {
    // Arrange & Act
    render(
      <MemoryRouter initialEntries={['/menu']}>
        <Footer />
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText(/chess platform v2.6.0/i)).toBeDefined();
    expect(screen.getByText('BATUHAN BAYSAL')).toBeDefined();
    expect(screen.getByRole('link', { name: /swagger/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /github/i })).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText(/online/i)).toBeDefined();
    });
  });

  it('renders STANDBY badge when on an authentication page', () => {
    // Arrange & Act
    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <Footer />
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText(/standby/i)).toBeDefined();
  });

  it('returns null and renders nothing when isInGame is true or route starts with /game', () => {
    // Arrange & Act
    const { container: inGamePropContainer } = render(
      <MemoryRouter initialEntries={['/menu']}>
        <Footer isInGame={true} />
      </MemoryRouter>
    );

    // Assert
    expect(inGamePropContainer.firstChild).toBeNull();

    // Arrange & Act
    const { container: inGamePathContainer } = render(
      <MemoryRouter initialEntries={['/game']}>
        <Footer />
      </MemoryRouter>
    );

    // Assert
    expect(inGamePathContainer.firstChild).toBeNull();
  });

  it('sets ping to fallback 999ms when health check fetch fails', async () => {
    // Arrange
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network offline'));

    // Act
    render(
      <MemoryRouter initialEntries={['/menu']}>
        <Footer />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('999ms')).toBeDefined();
    });
  });
});
