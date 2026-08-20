import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export type LoginCredentials = { usernameOrEmail: string; password: string };
export type RegisterCredentials = { username: string; email: string; password: string };

export interface AuthUser {
  id: number;
  username: string;
  role: 'ROLE_USER' | 'ROLE_GUEST' | 'ROLE_ADMIN';
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
        logout(); 
      }
    }
    setLoading(false);
  }, []);

  const updateUser = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const login = async (creds: { usernameOrEmail: string; password: string }) => {
    try {
      const response = await api.post('/api/auth/login', creds);
      const { token, id, username, role } = response.data;
      
      const userData: AuthUser = { id: Number(id), username, role };
      
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
      const { token, id, username, role } = response.data;

      const userData: AuthUser = { 
        id: Number(id), 
        username: username, 
        role: role 
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

  return { user, login, register, loginAsGuest, logout, updateUser, loading };
};
