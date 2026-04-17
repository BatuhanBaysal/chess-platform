package com.batuhan.chess.api.controller;

import com.batuhan.chess.application.service.game.LobbyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping("/api/lobby")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class LobbyController {

    private final LobbyService lobbyService;

    @PostMapping("/create")
    public ResponseEntity<String> createRoom(
        @RequestParam Long userId,
        @RequestParam String username,
        @RequestParam int time) {

        log.info("Lobby create request - User: {}, Time: {}", username, time);
        String roomId = lobbyService.createRoom(userId, username, time);
        return ResponseEntity.ok(roomId);
    }

    @PostMapping("/join")
    public ResponseEntity<Boolean> joinRoom(
        @RequestParam String roomId,
        @RequestParam Long userId,
        @RequestParam String username) {

        log.info("Lobby join request - Room: {}, User: {}", roomId, username);
        boolean joined = lobbyService.joinRoom(roomId, userId, username);

        if (!joined) {
            log.warn("Join failed for Room: {} and User: {}", roomId, username);
            return ResponseEntity.badRequest().body(false);
        }

        return ResponseEntity.ok(true);
    }

    @GetMapping("/rooms")
    public ResponseEntity<Collection<LobbyService.GameRoom>> getRooms() {
        return ResponseEntity.ok(lobbyService.getAllActiveRooms());
    }

    @GetMapping("/status/{roomId}")
    public ResponseEntity<LobbyService.GameRoom> getLobbyStatus(@PathVariable String roomId) {
        LobbyService.GameRoom room = lobbyService.getRoom(roomId);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(room);
    }
}
