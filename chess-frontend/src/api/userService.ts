import api from './axios';

import type {
  UserResponseDTO,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  AvatarUploadResponse
} from '../types';

export type {
  UserResponseDTO,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  AvatarUploadResponse
};

export type UserResponse = UserResponseDTO;
export type LeaderboardUser = UserResponseDTO;

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export const getMyProfile = async (): Promise<UserResponseDTO> => {
  const response = await api.get<UserResponseDTO>('/api/users/me');
  return response.data;
};

export const getLeaderboard = async (): Promise<UserResponseDTO[]> => {
  const response = await api.get<UserResponseDTO[]>('/api/users/leaderboard');
  return response.data;
};

export const getFullLeaderboard = async (
  page: number = 0,
  size: number = 10
): Promise<PageResponse<LeaderboardUser>> => {
  const response = await api.get<PageResponse<LeaderboardUser>>('/api/users/leaderboard/all', {
    params: { page, size }
  });
  return response.data;
};

export const updateMyProfile = async (data: UpdateProfileRequest): Promise<void> => {
  await api.put('/api/users/me', data);
};

export const changeMyPassword = async (data: ChangePasswordRequest): Promise<void> => {
  await api.put('/api/users/me/password', data);
};

export const deleteMyAccount = async (data: DeleteAccountRequest): Promise<void> => {
  await api.delete('/api/users/me', { data });
};

export const uploadAvatar = async (file: File): Promise<AvatarUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<AvatarUploadResponse>('/api/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
