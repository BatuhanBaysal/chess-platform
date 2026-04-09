import axios from './axios'; 

export const getUserStats = async (userId: number) => {
    const response = await axios.get(`/api/users/${userId}/stats`);
    return response.data;
};

export const getPlayerHistory = async (userId: number) => {
    const response = await axios.get(`/api/games/history/${userId}`);
    return response.data;
};
