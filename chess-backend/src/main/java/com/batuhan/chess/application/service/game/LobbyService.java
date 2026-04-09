package com.batuhan.chess.application.service.game;

import lombok.Data;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LobbyService {

    private final Map<String, GameRoom> activeRooms = new ConcurrentHashMap<>();

    @Data
    public static class GameRoom {
        private String roomId;
        private Long hostId;
        private String hostName;
        private Long blackPlayerId;
        private String status;
        private int timeControl;
    }

    public String createRoom(Long userId, String username, int time) {
        String roomId = UUID.randomUUID().toString().substring(0, 8);
        GameRoom room = new GameRoom();
        room.setRoomId(roomId);
        room.setHostId(userId);
        room.setHostName(username);
        room.setTimeControl(time);
        room.setStatus("WAITING");
        activeRooms.put(roomId, room);
        return roomId;
    }

    public boolean joinRoom(String roomId, Long userId) {
        GameRoom room = activeRooms.get(roomId);
        if (room != null && "WAITING".equals(room.getStatus())) {
            room.setBlackPlayerId(userId);
            room.setStatus("IN_PROGRESS");
            return true;
        }
        return false;
    }

    public Collection<GameRoom> getAllActiveRooms() {
        return activeRooms.values();
    }

    public void removeRoom(String roomId) {
        activeRooms.remove(roomId);
    }
}
