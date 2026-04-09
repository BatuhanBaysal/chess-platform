package com.batuhan.chess.api.controller;

import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.application.service.game.LobbyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping("/api/lobby")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LobbyController {

    private final LobbyService lobbyService;
    private final GameService gameService;

    @PostMapping("/create")
    public ResponseEntity<String> createRoom(
        @RequestParam Long userId,
        @RequestParam String username,
        @RequestParam int time) {

        String roomId = lobbyService.createRoom(userId, username, time);
        gameService.initializeGameFromLobby(roomId, userId, null);

        return ResponseEntity.ok(roomId);
    }

    @PostMapping("/join")
    public ResponseEntity<Boolean> joinRoom(
        @RequestParam String roomId,
        @RequestParam Long userId) {

        boolean joined = lobbyService.joinRoom(roomId, userId);

        if (joined) {
            var rooms = lobbyService.getAllActiveRooms();
            var room = rooms.stream()
                .filter(r -> r.getRoomId().equals(roomId))
                .findFirst()
                .orElse(null);

            if (room != null) {
                gameService.initializeGameFromLobby(roomId, room.getHostId(), userId);
            }
        }

        return ResponseEntity.ok(joined);
    }

    @GetMapping("/rooms")
    public ResponseEntity<Collection<LobbyService.GameRoom>> getRooms() {
        return ResponseEntity.ok(lobbyService.getAllActiveRooms());
    }
}
