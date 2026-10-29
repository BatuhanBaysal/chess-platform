import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuth } from './useAuth';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('useAuth Hook', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Arrange
    localStorage.clear();
    vi.clearAllMocks();
    
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
  });

  it('initializes with null user and loading true, then sets loading false', async () => {
    // Arrange & Act
    const { result } = renderHook(() => useAuth());

    // Assert
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('loads saved user from localStorage if token and user exist', () => {
    // Arrange
    const savedUser = { id: 1, username: 'batuhan', role: 'ROLE_USER' };
    localStorage.setItem('user', JSON.stringify(savedUser));
    localStorage.setItem('token', 'fake-token');

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    expect(result.current.user).toEqual(savedUser);
    expect(result.current.loading).toBe(false);
  });

  it('clears storage and user if savedUser JSON is invalid', () => {
    // Arrange
    localStorage.setItem('user', 'invalid-json');
    localStorage.setItem('token', 'fake-token');

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('logs in successfully, updates state and stores tokens', async () => {
    // Arrange
    const mockAuthResponse = {
      data: {
        token: 'jwt-token',
        id: 1,
        username: 'batuhan',
        role: 'ROLE_USER',
      },
    };
    vi.mocked(api.post).mockResolvedValueOnce(mockAuthResponse);

    const { result } = renderHook(() => useAuth());

    // Act
    let userData;
    await act(async () => {
      userData = await result.current.login({ usernameOrEmail: 'batuhan', password: '123' });
    });

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
      usernameOrEmail: 'batuhan',
      password: '123',
    });
    expect(result.current.user).toEqual({ id: 1, username: 'batuhan', role: 'ROLE_USER' });
    expect(localStorage.getItem('token')).toBe('jwt-token');
    expect(localStorage.getItem('userId')).toBe('1');
    expect(userData).toEqual({ id: 1, username: 'batuhan', role: 'ROLE_USER' });
  });

  it('throws error and logs to console when login request rejects', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Invalid login credentials'));

    const { result } = renderHook(() => useAuth());

    // Act & Assert
    await expect(
      result.current.login({ usernameOrEmail: 'batuhan', password: 'bad' })
    ).rejects.toThrow('Invalid login credentials');
    expect(console.error).toHaveBeenCalledWith('Authentication process failed:', expect.any(Error));
  });

  it('registers successfully', async () => {
    // Arrange
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } });
    const { result } = renderHook(() => useAuth());

    // Act
    await act(async () => {
      await result.current.register({ username: 'batuhan', email: 'test@test.com', password: '123' });
    });

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
      username: 'batuhan',
      email: 'test@test.com',
      password: '123',
    });
  });

  it('throws error and logs to console when register request rejects', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Registration failed'));

    const { result } = renderHook(() => useAuth());

    // Act & Assert
    await expect(
      result.current.register({ username: 'batuhan', email: 'bad@test.com', password: '123' })
    ).rejects.toThrow('Registration failed');
    expect(console.error).toHaveBeenCalledWith('Account creation failed:', expect.any(Error));
  });

  it('logs in as guest successfully', async () => {
    // Arrange
    const mockGuestResponse = {
      data: {
        token: 'guest-token',
        id: 99,
        username: 'Guest_123',
        role: 'ROLE_GUEST',
      },
    };
    vi.mocked(api.post).mockResolvedValueOnce(mockGuestResponse);

    const { result } = renderHook(() => useAuth());

    // Act
    await act(async () => {
      await result.current.loginAsGuest();
    });

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/auth/guest');
    expect(result.current.user?.role).toBe('ROLE_GUEST');
    expect(localStorage.getItem('token')).toBe('guest-token');
  });

  it('throws error and logs to console when guest login rejects', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Guest service error'));

    const { result } = renderHook(() => useAuth());

    // Act & Assert
    await expect(result.current.loginAsGuest()).rejects.toThrow('Guest service error');
    expect(console.error).toHaveBeenCalledWith('Guest session initialization failed:', expect.any(Error));
  });

  it('updates user state and localStorage correctly via updateUser', () => {
    // Arrange
    const { result } = renderHook(() => useAuth());
    const newUser = { id: 2, username: 'yeniuser', role: 'ROLE_ADMIN' as const };

    // Act
    act(() => {
      result.current.updateUser(newUser);
    });

    // Assert
    expect(result.current.user).toEqual(newUser);
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(newUser);
  });

  it('logs out, clears storage, resets user and redirects to home', () => {
    // Arrange
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', '{}');
    localStorage.setItem('userId', '1');

    const { result } = renderHook(() => useAuth());

    // Act
    act(() => {
      result.current.logout();
    });

    // Assert
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(window.location.href).toBe('/');
  });
});
