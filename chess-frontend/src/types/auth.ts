import type { UserRole } from './admin';

export interface AuthResponse {
  id: number;
  token: string;
  username: string;
  email: string;
  eloRating: number | null;
  role: UserRole;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
