import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './axios';

describe('Axios Interceptors', () => {
  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.alert = vi.fn();

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  it('attaches Authorization header when token exists in localStorage', async () => {
    // Arrange
    localStorage.setItem('token', 'valid-jwt-token');

    // Act
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = await requestInterceptor({ headers: {} });

    // Assert
    expect(config.headers.Authorization).toBe('Bearer valid-jwt-token');
  });

  it('does not attach Authorization header when token does not exist', async () => {
    // Act
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = await requestInterceptor({ headers: {} });

    // Assert
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('returns response object directly on successful response interceptor', () => {
    // Arrange
    const responseInterceptor = (api.interceptors.response as any).handlers[0].fulfilled;
    const mockResponse = { data: { success: true }, status: 200 };

    // Act
    const result = responseInterceptor(mockResponse);

    // Assert
    expect(result).toBe(mockResponse);
  });

  it('handles 401 ACCOUNT_DEACTIVATED by clearing storage, alerting, and redirecting', async () => {
    // Arrange
    localStorage.setItem('token', 'old-token');
    sessionStorage.setItem('key', 'val');
    const responseErrorInterceptor = (api.interceptors.response as any).handlers[0].rejected;

    const error = {
      response: {
        status: 401,
        data: { message: 'Your user is ACCOUNT_DEACTIVATED' },
      },
    };

    // Act & Assert
    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('key')).toBeNull();
    expect(window.alert).toHaveBeenCalledWith(
      'Your account has been deleted. Please register a new profile.'
    );
    expect(window.location.href).toBe('/sign-up');
  });

  it('handles 401 deactivated or deleted message variation correctly', async () => {
    // Arrange
    localStorage.setItem('token', 'old-token');
    sessionStorage.setItem('key', 'val');
    const responseErrorInterceptor = (api.interceptors.response as any).handlers[0].rejected;

    const error = {
      response: {
        status: 401,
        data: { message: 'Account is deactivated or deleted by admin' },
      },
    };

    // Act & Assert
    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('key')).toBeNull();
    expect(window.alert).toHaveBeenCalledWith(
      'Your account has been deleted. Please register a new profile.'
    );
    expect(window.location.href).toBe('/sign-up');
  });

  it('passes regular errors through without redirecting', async () => {
    // Arrange
    const responseErrorInterceptor = (api.interceptors.response as any).handlers[0].rejected;
    const error = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    };

    // Act & Assert
    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
    expect(window.alert).not.toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });
});
