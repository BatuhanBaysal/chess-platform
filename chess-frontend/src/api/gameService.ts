import api from './axios'; 

export const loginAsGuest = async () => {
    return (await api.post('/api/auth/guest')).data;
};

export const getUserStats = async (userId: number) => {
    const response = await api.get(`/api/users/${userId}/stats`); 
    return response.data;
};

export const getPlayerHistory = async (userId: number) => {
    const response = await api.get(`/api/games/history/${userId}`);
    return response.data;
};

export const createLobby = async (userId: number, username: string, timeControl: number) => {
    const response = await api.post(`/api/lobby/create`, null, {
        params: { userId, username, time: timeControl }
    });
    return response.data; 
};

export const joinRoom = async (roomId: string, userId: number) => {
    const response = await api.post(`/api/lobby/join`, null, {
        params: { roomId, userId }
    });
    return response.data;
};

export const getActiveRooms = async () => {
    try {
        const response = await api.get(`/api/lobby/rooms`); 
        return response.data || []; 
    } catch (error) {
        console.error("Lobby fetch error:", error);
        return [];
    }
};
