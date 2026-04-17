import api from './axios'; 

export type GameStatus = 
    | 'ACTIVE' 
    | 'CHECK' 
    | 'CHECKMATE' 
    | 'STALEMATE' 
    | 'RESIGNED' 
    | 'DRAW' 
    | 'TIMEOUT'   
    | 'CLOSING';

export interface ExecutedMove {
    fromFile: number;
    fromRank: number;
    toFile: number;
    toRank: number;
    pieceType: string;
    moveType: string; 
    capturedPiece?: string;
}

export interface GameResponse {
    gameId: string;
    boardRepresentation: string;
    currentTurn: 'WHITE' | 'BLACK'; 
    status: GameStatus; 
    whitePlayerId: number; 
    blackPlayerId: number;
    isStarted: boolean; 
    humanReadableHistory: string[]; 
    lastMoveMessage: string;
    executedMoves: ExecutedMove[];
}

export interface LegalMove {
    file: number;
    rank: number;
}

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

export const joinRoom = async (roomId: string, userId: number, username: string) => {
    const response = await api.post(`/api/lobby/join`, null, {
        params: { roomId, userId, username } 
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

export const getLobbyStatus = async (roomId: string) => {
    try {
        const response = await api.get(`/api/lobby/status/${roomId}`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching lobby status:", error);
        return null;
    }
};

export const getGameContext = async (gameId: string, userId: number) => {
    const response = await api.get(`/api/games/${gameId}`, {
        params: { userId }
    });
    return response.data as GameResponse;
};

export const getLegalMoves = async (gameId: string, file: number, rank: number): Promise<LegalMove[]> => {
    try {
        const response = await api.get(`/api/games/${gameId}/legal-moves`, {
            params: { file, rank }
        });
        return response.data;
    } catch (error) {
        console.error("Legal moves fetch error:", error);
        return [];
    }
};

export const resignGame = async (gameId: string, userId: number) => {
    return await api.post(`/api/games/${gameId}/resign`, null, {
        params: { userId }
    });
};
