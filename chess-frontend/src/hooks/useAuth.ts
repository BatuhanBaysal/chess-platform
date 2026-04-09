import { useState, useEffect } from 'react';
import api from '../api/axios';

export type LoginCredentials = { username: string; password:  string };
export type RegisterCredentials = { username: string; email: string; password: string };

export const useAuth = () => {
  const [user, setUser] = useState<{ id: number; username: string; isGuest: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (creds: LoginCredentials) => {
    const response = await api.post('/api/auth/login', creds);
    const { token, id, username, isGuest } = response.data;
    
    const userData = { id: Number(id), username, isGuest: !!isGuest };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return response.data;
  };

  const register = async (creds: RegisterCredentials) => {
    return await api.post('/api/auth/register', creds);
  };

  const loginAsGuest = async () => {
    try {
      const response = await api.post('/api/auth/guest');
      const { token, id, username, isGuest } = response.data;

      const userData = { 
        id: Number(id), 
        username: username, 
        isGuest: !!isGuest 
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error("Guest login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
    window.location.href = '/';
  };

  return { user, login, register, loginAsGuest, logout, loading };
};
