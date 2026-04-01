import { useState, useEffect } from 'react';
import api from '../api/axios';

export type LoginCredentials = { username: string; password:  string };
export type RegisterCredentials = { username: string; email: string; password: string };

export const useAuth = () => {
  const [user, setUser] = useState<{username: string, isGuest: boolean} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setLoading(false);
  }, []);

  const login = async (creds: LoginCredentials) => {
    const response = await api.post('/auth/login', creds);
    const { token, username, isGuest } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ username, isGuest: !!isGuest }));
    setUser({ username, isGuest: !!isGuest });
  };

  const register = async (creds: RegisterCredentials) => {
    await api.post('/auth/register', creds);
  };

  const loginAsGuest = async () => {
    const response = await api.post('/auth/guest');
    const { token, username, isGuest } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ username, isGuest }));
    setUser({ username, isGuest });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  return { user, login, register, loginAsGuest, logout, loading };
};
