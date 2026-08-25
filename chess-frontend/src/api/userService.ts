import api from './axios';

export interface UserResponse {
    username: string;
    email: string;
    eloRating: number;
    totalWins: number;
    totalLosses: number;
    totalDraws: number;
    totalGames: number;
    role: 'ROLE_USER' | 'ROLE_GUEST' | 'ROLE_ADMIN';
}

export interface LeaderboardUser {
    username: string;
    eloRating: number;
    totalWins: number;      
    totalLosses: number;    
    totalDraws: number; 
    totalGames: number;
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

export const getMyProfile = async (): Promise<UserResponse> => {
    const response = await api.get('/api/users/me');
    return response.data;
};

export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
    const response = await api.get('/api/users/leaderboard');
    return response.data;
};

export const getFullLeaderboard = async (): Promise<LeaderboardUser[]> => {
    const response = await api.get('/api/users/leaderboard/all');
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
