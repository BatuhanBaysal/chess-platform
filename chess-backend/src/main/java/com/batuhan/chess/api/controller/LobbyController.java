package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.lobby.CreateRoomRequest;
import com.batuhan.chess.api.dto.lobby.GameRoomResponse;
import com.batuhan.chess.api.dto.lobby.JoinRoomRequest;
import com.batuhan.chess.application.service.game.LobbyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@Slf4j
@RestController
@RequestMapping("/api/lobby")
@RequiredArgsConstructor
@Tag(name = "Lobby Management", description = "Endpoints for managing game lobbies, rooms, joining, and matchmaking.")
public class LobbyController {

    private final LobbyService lobbyService;

    @Operation(
        summary = "Create a new game room",
        description = "Initializes a new matchmaking lobby room with specified time limits and theme."
    )
    @ApiResponse(responseCode = "200", description = "Room created successfully, returns room ID")
    @PostMapping("/create")
    public ResponseEntity<String> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        log.info("LOBBY_ACTION: Room creation requested - userId: {}, username: {}, time: {}, theme: {}",
            request.userId(), request.username(), request.time(), request.theme());
        String roomId = lobbyService.createRoom(request.userId(), request.username(), request.time(), request.theme());
        log.info("LOBBY_ACTION: Room successfully created with ID: {}", roomId);
        return ResponseEntity.ok(roomId);
    }

    @Operation(
        summary = "Join an existing game room",
        description = "Allows a player to join an active open lobby room."
    )
    @ApiResponse(responseCode = "200", description = "Successfully joined room")
    @ApiResponse(responseCode = "400", description = "Failed to join room (room full, started, or active game exists)")
    @PostMapping("/join")
    public ResponseEntity<Void> joinRoom(@Valid @RequestBody JoinRoomRequest request) {
        log.info("LOBBY_ACTION: Join request received - Room: {}, userId: {}, username: {}",
            request.roomId(), request.userId(), request.username());
        lobbyService.joinRoom(request.roomId(), request.userId(), request.username());
        log.info("LOBBY_ACTION: User successfully joined Room: {}", request.roomId());
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "Get all active rooms",
        description = "Retrieves a collection of all currently available lobby rooms."
    )
    @ApiResponse(responseCode = "200", description = "Active rooms retrieved successfully")
    @GetMapping("/rooms")
    public ResponseEntity<Collection<GameRoomResponse>> getRooms() {
        log.info("LOBBY_ACTION: Fetching all active lobby rooms");
        Collection<GameRoomResponse> rooms = lobbyService.getAllActiveRooms();
        log.info("LOBBY_ACTION: Retrieved {} active rooms", rooms.size());
        return ResponseEntity.ok(rooms);
    }

    @Operation(
        summary = "Get room status by ID",
        description = "Retrieves detailed state and player info for a specific lobby room."
    )
    @ApiResponse(responseCode = "200", description = "Room status retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Room not found")
    @GetMapping("/status/{roomId}")
    public ResponseEntity<GameRoomResponse> getLobbyStatus(@PathVariable String roomId) {
        log.info("LOBBY_ACTION: Fetching status for room ID: {}", roomId);
        return lobbyService.getRoom(roomId)
            .map(room -> {
                log.info("LOBBY_ACTION: Room found with ID: {}", roomId);
                return ResponseEntity.ok(room);
            })
            .orElseGet(() -> {
                log.warn("LOBBY_ACTION: Room not found with ID: {}", roomId);
                return ResponseEntity.notFound().build();
            });
    }

    @Operation(
        summary = "Cancel / Delete a lobby room",
        description = "Allows the creator or authorized user to cancel an open lobby room."
    )
    @ApiResponse(responseCode = "204", description = "Room cancelled successfully")
    @ApiResponse(responseCode = "400/404", description = "Failed to cancel or room not found")
    @DeleteMapping("/cancel/{roomId}")
    public ResponseEntity<Void> cancelRoom(
        @PathVariable String roomId,
        @RequestParam Long userId) {

        log.info("LOBBY_ACTION: Cancel request received - Room: {}, userId: {}", roomId, userId);
        lobbyService.cancelRoom(roomId, userId);
        log.info("LOBBY_ACTION: Room successfully cancelled/deleted: {}", roomId);
        return ResponseEntity.noContent().build();
    }
}
