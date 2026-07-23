import api from './axios';

export interface AdminUserResponseDTO {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface AdminActiveGameResponseDTO {
    gameId: string;
    whitePlayerId: number;
    blackPlayerId: number;
    whiteRemainingTimeMs?: number;
    blackRemainingTimeMs?: number;
    status: string;
    startTime?: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const getAllUsers = async (page: number = 0, size: number = 10): Promise<Page<AdminUserResponseDTO>> => {
    const response = await api.get('/api/admin/users', {
        params: { page, size }
    });
    return response.data;
};

export const deleteUserAccount = async (id: number): Promise<void> => {
    await api.delete(`/api/admin/users/${id}`);
};

export const getActiveGames = async (): Promise<AdminActiveGameResponseDTO[]> => {
    const response = await api.get('/api/admin/games/active');
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
