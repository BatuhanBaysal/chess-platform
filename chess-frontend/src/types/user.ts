import type { UserRole } from './admin';

export interface UserResponseDTO {
  username: string;
  email: string;
  eloRating: number | null;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalGames: number;
  role: UserRole;
}

export interface UpdateProfileRequest {
  username: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
  message: string;
}
