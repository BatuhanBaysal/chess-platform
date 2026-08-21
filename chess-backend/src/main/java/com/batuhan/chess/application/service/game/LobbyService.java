package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.lobby.GameRoomResponse;
import com.batuhan.chess.api.dto.lobby.MatchFoundMessage;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class LobbyService {

    private static final String STATUS_WAITING = "WAITING";
    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String STATUS_START_GAME = "START_GAME";

    private final Map<String, GameRoomInternal> activeRooms = new ConcurrentHashMap<>();
    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public LobbyService(@Lazy GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @Data
    public static class GameRoomInternal {
        private String roomId;
        private Long hostId;
        private String hostName;
        private Long blackPlayerId;
        private String blackPlayerName;
        private String status;
        private int timeLimit;
        private String theme;

        public GameRoomResponse toResponse() {
            return GameRoomResponse.builder()
                .roomId(roomId)
                .hostId(hostId)
                .hostName(hostName)
                .blackPlayerId(blackPlayerId)
                .blackPlayerName(blackPlayerName)
                .status(status)
                .timeLimit(timeLimit)
                .theme(theme)
                .build();
        }
    }

    public String createRoom(Long userId, String username, int time, String theme) {
        String roomId = UUID.randomUUID().toString().substring(0, 8);
        GameRoomInternal room = new GameRoomInternal();
        room.setRoomId(roomId);
        room.setHostId(userId);
        room.setHostName(username);
        room.setTimeLimit(time);
        room.setTheme(theme);
        room.setStatus(STATUS_WAITING);

        activeRooms.put(roomId, room);
        log.info("LOBBY_SERVICE: Room created: {} by user: {}, Time Limit: {}m, Theme: {}", roomId, username, time, theme);
        return roomId;
    }

    public void cancelRoom(String roomId, Long userId) {
        activeRooms.compute(roomId, (id, room) -> {
            if (room == null) {
                throw new ResourceNotFoundException("Room not found with ID: " + roomId);
            }
            if (!room.getHostId().equals(userId)) {
                throw new IllegalStateException("Only the host can cancel this room.");
            }

            messagingTemplate.convertAndSend("/topic/lobby", Map.of(
                "type", "LOBBY_CANCELLED",
                "roomId", roomId
            ));

            log.info("LOBBY_SERVICE: Room cancelled and removed: {} by host: {}", roomId, userId);
            return null;
        });
    }

    public void joinRoom(String roomId, Long userId, String username) {
        activeRooms.compute(roomId, (id, room) -> {
            if (room == null || !STATUS_WAITING.equals(room.getStatus())) {
                log.warn("LOBBY_SERVICE: Attempt to join invalid or expired room: {} by user: {}", roomId, userId);
                throw new IllegalStateException("Room is invalid, expired, or already in progress.");
            }

            if (room.getHostId().equals(userId)) {
                log.warn("LOBBY_SERVICE: User {} tried to join their own room {}", userId, roomId);
                throw new IllegalArgumentException("You cannot join your own room.");
            }

            String activeGameId = gameService.getActiveGameIdByUserId(userId);
            if (activeGameId != null) {
                log.warn("LOBBY_SERVICE: User {} tried to join room {} while already in active game {}", userId, roomId, activeGameId);
                throw new IllegalStateException("You are already in an active game session.");
            }

            room.setBlackPlayerId(userId);
            room.setBlackPlayerName(username);
            room.setStatus(STATUS_IN_PROGRESS);

            gameService.createNewGameWithPlayers(roomId, room.getHostId(), userId);
            notifyPlayers(room, username);
            log.info("LOBBY_SERVICE: Match started in room: {}. White: {}, Black: {}", roomId, room.getHostId(), userId);

            return room;
        });
    }

    private void notifyPlayers(GameRoomInternal room, String joinerName) {
        MatchFoundMessage whiteMsg = MatchFoundMessage.builder()
            .gameId(room.getRoomId())
            .status(STATUS_START_GAME)
            .color("WHITE")
            .opponentId(room.getBlackPlayerId())
            .opponentName(joinerName)
            .theme(room.getTheme())
            .build();

        MatchFoundMessage blackMsg = MatchFoundMessage.builder()
            .gameId(room.getRoomId())
            .status(STATUS_START_GAME)
            .color("BLACK")
            .opponentId(room.getHostId())
            .opponentName(room.getHostName())
            .theme(room.getTheme())
            .build();

        messagingTemplate.convertAndSend("/topic/lobby/" + room.getRoomId(), whiteMsg);
        messagingTemplate.convertAndSend("/topic/lobby/" + room.getRoomId(), blackMsg);
    }

    public Collection<GameRoomResponse> getAllActiveRooms() {
        return activeRooms.values().stream()
            .filter(room -> STATUS_WAITING.equals(room.getStatus()))
            .map(GameRoomInternal::toResponse)
            .toList();
    }

    public void removeRoom(String roomId) {
        activeRooms.remove(roomId);
        log.info("LOBBY_SERVICE: Room explicitly removed: {}", roomId);
    }

    public Optional<GameRoomResponse> getRoom(String roomId) {
        GameRoomInternal room = activeRooms.get(roomId);
        return Optional.ofNullable(room).map(GameRoomInternal::toResponse);
    }
}
