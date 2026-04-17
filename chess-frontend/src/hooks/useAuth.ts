import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export type LoginCredentials = { username: string; password:  string };
export type RegisterCredentials = { username: string; email: string; password: string };

export interface AuthUser {
  id: number;
  username: string;
  isGuest: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
      }
    }
    setLoading(false);
  }, []);

  const login = async (creds: LoginCredentials) => {
    try {
      const response = await api.post('/api/auth/login', creds);
      const { token, id, username, isGuest } = response.data;
      
      const userData: AuthUser = { id: Number(id), username, isGuest: !!isGuest };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', id.toString());
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Authentication process failed:", error);
      throw error;
    }
  };

  const register = async (creds: RegisterCredentials) => {
    try {
      return await api.post('/api/auth/register', creds);
    } catch (error) {
      console.error("Account creation failed:", error);
      throw error;
    }
  };

  const loginAsGuest = async (): Promise<AuthUser> => {
    try {
      const response = await api.post('/api/auth/guest');
      const { token, id, username, isGuest } = response.data;

      const userData: AuthUser = { 
        id: Number(id), 
        username: username, 
        isGuest: !!isGuest 
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', id.toString());
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Guest session initialization failed:", error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
    window.location.href = '/';
  }, []);

  return { user, login, register, loginAsGuest, logout, loading };
};
