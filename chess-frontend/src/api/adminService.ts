import api from './axios';
import type { 
  AdminUserResponseDTO, 
  AdminActiveGameResponseDTO, 
  AuditLogResponse, 
  PageResponse 
} from '../types';

export type { 
  AdminUserResponseDTO, 
  AdminActiveGameResponseDTO, 
  AuditLogResponse, 
  PageResponse 
};

export type AdminAuditLogResponseDTO = AuditLogResponse;

export const getAllUsers = async (page: number = 0, size: number = 10): Promise<PageResponse<AdminUserResponseDTO>> => {
  const response = await api.get<PageResponse<AdminUserResponseDTO>>('/api/admin/users', {
    params: { page, size }
  });
  return response.data;
};

export const deleteUserAccount = async (id: number): Promise<void> => {
  await api.delete(`/api/admin/users/${id}`);
};

export const getActiveGames = async (): Promise<AdminActiveGameResponseDTO[]> => {
  const response = await api.get<AdminActiveGameResponseDTO[]>('/api/admin/games/active');
  return response.data;
};

export const forceFinishGame = async (gameId: string): Promise<void> => {
  await api.post(`/api/admin/games/${gameId}/force-finish`);
};

export const triggerSandboxGame = async (whiteId: number, blackId: number): Promise<void> => {
  await api.post('/api/admin/sandbox/trigger-game', null, {
    params: { whiteId, blackId }
  });
};

export const getAuditLogs = async (
  page: number = 0, 
  size: number = 10,
  actionType?: string,
  adminId?: number
): Promise<PageResponse<AuditLogResponse>> => {
  const response = await api.get<PageResponse<AuditLogResponse>>('/api/admin/audit-logs', {
    params: { page, size, actionType, adminId }
  });
  return response.data;
};
