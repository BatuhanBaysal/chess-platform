package com.batuhan.chess.application.service.game;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class LobbyService {

    private static final String STATUS_WAITING = "WAITING";
    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String STATUS_START_GAME = "START_GAME";

    private final Map<String, GameRoom> activeRooms = new ConcurrentHashMap<>();
    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    @Data
    public static class GameRoom {
        private String roomId;
        private Long hostId;
        private String hostName;
        private Long blackPlayerId;
        private String blackPlayerName;
        private String status;
        private int timeControl;
    }

    @Data
    @Builder
    public static class MatchFoundMessage {
        private String gameId;
        private String status;
        private String color;
        private Long opponentId;
        private String opponentName;
    }

    public String createRoom(Long userId, String username, int time) {
        String roomId = UUID.randomUUID().toString().substring(0, 8);
        GameRoom room = new GameRoom();
        room.setRoomId(roomId);
        room.setHostId(userId);
        room.setHostName(username);
        room.setTimeControl(time);
        room.setStatus(STATUS_WAITING);

        activeRooms.put(roomId, room);
        log.info("Room created: {} by user: {}", roomId, username);
        return roomId;
    }

    public boolean joinRoom(String roomId, Long userId, String username) {
        GameRoom room = activeRooms.get(roomId);

        if (room != null && STATUS_WAITING.equals(room.getStatus())) {
            if (room.getHostId().equals(userId)) {
                log.warn("User {} tried to join their own room {}", userId, roomId);
                return false;
            }

            room.setBlackPlayerId(userId);
            room.setBlackPlayerName(username);
            room.setStatus(STATUS_IN_PROGRESS);

            gameService.createNewGameWithPlayers(roomId, room.getHostId(), userId);
            notifyPlayers(room, username);

            log.info("Match started in room: {}. White: {}, Black: {}", roomId, room.getHostId(), userId);
            return true;
        }
        return false;
    }

    private void notifyPlayers(GameRoom room, String joinerName) {
        MatchFoundMessage whiteMsg = MatchFoundMessage.builder()
            .gameId(room.getRoomId())
            .status(STATUS_START_GAME)
            .color("WHITE")
            .opponentId(room.getBlackPlayerId())
            .opponentName(joinerName)
            .build();

        MatchFoundMessage blackMsg = MatchFoundMessage.builder()
            .gameId(room.getRoomId())
            .status(STATUS_START_GAME)
            .color("BLACK")
            .opponentId(room.getHostId())
            .opponentName(room.getHostName())
            .build();

        messagingTemplate.convertAndSend("/topic/lobby/" + room.getRoomId(), whiteMsg);
        messagingTemplate.convertAndSend("/topic/lobby/" + room.getRoomId(), blackMsg);
    }

    public Collection<GameRoom> getAllActiveRooms() {
        return activeRooms.values().stream()
            .filter(room -> STATUS_WAITING.equals(room.getStatus()))
            .toList();
    }

    public void removeRoom(String roomId) {
        activeRooms.remove(roomId);
    }

    public GameRoom getRoom(String roomId) {
        return activeRooms.get(roomId);
    }
}
