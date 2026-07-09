import axios from './axios';

export interface UserResponse {
    username: string;
    email: string;
    eloRating: number;
    totalWins: number;
    totalLosses: number;
    totalDraws: number;
    role: 'ROLE_USER' | 'ROLE_GUEST' | 'ROLE_ADMIN';
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
    const response = await axios.get('/api/users/me');
    return response.data;
};

export const updateMyProfile = async (data: UpdateProfileRequest): Promise<void> => {
    await axios.put('/api/users/me', data);
};

export const changeMyPassword = async (data: ChangePasswordRequest): Promise<void> => {
    await axios.put('/api/users/me/password', data);
};

export const deleteMyAccount = async (data: DeleteAccountRequest): Promise<void> => {
    await axios.delete('/api/users/me', { data });
};
