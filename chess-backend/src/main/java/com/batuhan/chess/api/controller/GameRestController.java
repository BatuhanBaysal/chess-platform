package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.game.GameExportResponse;
import com.batuhan.chess.api.dto.game.GameHistory;
import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.HintResponse;
import com.batuhan.chess.api.dto.storage.FileDownloadDTO;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.application.service.game.GameArtifactService;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.Position;
import com.batuhan.chess.domain.model.history.GameEntity;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
@Tag(name = "Game Management", description = "Endpoints for managing chess games, AI matches, legal moves, and game history.")
public class GameRestController {

    private final GameService gameService;
    private final GameArtifactService artifactService;

    @Operation(
        summary = "Get game by ID",
        description = "Retrieves current state and details of an active or finished chess game."
    )
    @ApiResponse(responseCode = "200", description = "Game retrieved successfully")
    @GetMapping("/{gameId}")
    public ResponseEntity<GameResponse> getGame(@PathVariable String gameId) {
        log.info("GAME_ACTION: Fetching game with ID: {}", gameId);
        return Optional.ofNullable(gameService.getGame(gameId))
            .map(game -> ResponseEntity.ok(gameService.convertToResponse(gameId, game)))
            .orElseThrow(() -> new ResourceNotFoundException("Game session not found with id: " + gameId));
    }

    @Operation(
        summary = "Get active game for user",
        description = "Checks and returns active game session if the user is currently in a game."
    )
    @ApiResponse(responseCode = "200", description = "Active game found")
    @ApiResponse(responseCode = "404", description = "No active game found for user")
    @GetMapping("/active/{userId}")
    public ResponseEntity<GameResponse> getActiveGame(@PathVariable Long userId) {
        log.info("GAME_ACTION: Checking active game for user ID: {}", userId);
        String gameId = gameService.getActiveGameIdByUserId(userId);
        return Optional.ofNullable(gameId)
            .map(gameService::getGame)
            .map(game -> ResponseEntity.ok(gameService.convertToResponse(gameId, game)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Create a new multiplayer game",
        description = "Initializes a new chess game between two players."
    )
    @ApiResponse(responseCode = "200", description = "Game created successfully")
    @PostMapping
    @RateLimiter(name = "gameCreationLimiter")
    public ResponseEntity<GameResponse> createGame(
        @RequestParam(value = "whiteId", required = false) Long whiteId,
        @RequestParam(value = "blackId", required = false) Long blackId) {

        log.info("GAME_ACTION: Creating new game - whiteId: {}, blackId: {}", whiteId, blackId);
        String gameId = gameService.createGame(whiteId, blackId);
        return Optional.ofNullable(gameService.getGame(gameId))
            .map(game -> ResponseEntity.ok(gameService.convertToResponse(gameId, game)))
            .orElseThrow(() -> new ResourceNotFoundException("Failed to initialize game."));
    }

    @Operation(
        summary = "Create an AI game",
        description = "Initializes a new game session against an AI opponent."
    )
    @ApiResponse(responseCode = "200", description = "AI game created successfully")
    @PostMapping("/vs-ai")
    @RateLimiter(name = "gameCreationLimiter")
    public ResponseEntity<GameResponse> createAiGame(
        @RequestParam("userId") Long userId,
        @RequestParam(value = "playAsWhite", defaultValue = "true") boolean playAsWhite,
        @RequestParam(value = "difficulty", defaultValue = "3") int difficulty,
        @RequestParam(value = "timeLimit", defaultValue = "10") Integer timeLimit) {

        log.info("GAME_ACTION: Creating AI game for userId: {}, difficulty: {}", userId, difficulty);
        String gameId = gameService.createAiGame(userId, playAsWhite, difficulty, timeLimit);
        return Optional.ofNullable(gameService.getGame(gameId))
            .map(game -> ResponseEntity.ok(gameService.convertToResponse(gameId, game)))
            .orElseThrow(() -> new ResourceNotFoundException("Failed to initialize AI game."));
    }

    @Operation(
        summary = "Finish a game",
        description = "Triggers manual finish routine, calculates winner and saves to database."
    )
    @ApiResponse(responseCode = "200", description = "Game successfully finished and recorded")
    @PostMapping("/{gameId}/finish")
    public ResponseEntity<Void> finishGame(@PathVariable String gameId) {
        log.info("GAME_ACTION: End-of-game request received for: {}", gameId);
        boolean finished = gameService.finishGameIfActive(gameId);
        return finished ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @Operation(
        summary = "Get legal moves for a square",
        description = "Calculates and returns valid legal moves for a specific board coordinate."
    )
    @ApiResponse(responseCode = "200", description = "Legal moves retrieved successfully")
    @GetMapping("/{gameId}/legal-moves")
    public ResponseEntity<List<Position>> getLegalMoves(
        @PathVariable String gameId,
        @RequestParam int file,
        @RequestParam int rank) {

        log.info("GAME_ACTION: Fetching legal moves for gameId: {} at file: {}, rank: {}", gameId, file, rank);
        Game game = Optional.ofNullable(gameService.getGame(gameId))
            .orElseThrow(() -> new ResourceNotFoundException("Game not found: " + gameId));

        if (!gameService.isGameStarted(gameId)) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        return ResponseEntity.ok(game.getLegalMovesForSquare(new Position(file, rank)));
    }

    @Operation(
        summary = "Get engine hint",
        description = "Requests a move suggestion from the chess engine."
    )
    @ApiResponse(responseCode = "200", description = "Engine hint generated successfully")
    @GetMapping("/{gameId}/hint")
    public ResponseEntity<HintResponse> getEngineHint(
        @PathVariable("gameId") String gameId,
        @RequestParam(value = "depth", defaultValue = "10") int depth) {

        log.info("GAME_ACTION: Requesting engine hint for gameId: {} with depth: {}", gameId, depth);
        return ResponseEntity.ok(gameService.getEngineHint(gameId, depth));
    }

    @Operation(
        summary = "Export game as PGN",
        description = "Generates and exports the PGN record of a match from storage."
    )
    @ApiResponse(responseCode = "200", description = "PGN file exported successfully")
    @GetMapping("/{gameId}/export/pgn")
    public ResponseEntity<byte[]> exportGamePgn(@PathVariable String gameId) {
        log.info("GAME_ACTION: Exporting PGN for gameId: {}", gameId);
        FileDownloadDTO downloadDTO = artifactService.exportGamePgn(gameId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadDTO.fileName() + "\"")
            .contentType(MediaType.parseMediaType(downloadDTO.contentType()))
            .body(downloadDTO.data());
    }

    @Operation(
        summary = "Upload match artifact",
        description = "Stores engine logs, telemetry, or match artifacts into object storage."
    )
    @ApiResponse(responseCode = "200", description = "Artifact saved successfully")
    @PostMapping(value = "/{gameId}/artifacts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GameExportResponse> uploadMatchArtifact(
        @PathVariable String gameId,
        @RequestParam("file") MultipartFile file) {
        log.info("GAME_ACTION: Uploading artifact for gameId: {}", gameId);
        GameExportResponse response = artifactService.uploadMatchArtifact(gameId, file);
        log.info("GAME_ACTION: Artifact uploaded successfully with key: {}", response.storageKey());
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Get player game history",
        description = "Retrieves past completed match histories for a given user."
    )
    @ApiResponse(responseCode = "200", description = "Player history retrieved successfully")
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<GameHistory>> getPlayerHistory(@PathVariable Long userId) {
        log.info("GAME_ACTION: Fetching game history for userId: {}", userId);
        List<GameEntity> games = gameService.getGameHistory(userId);
        List<GameHistory> history = games.stream().map(game -> GameHistory.builder()
            .id(game.getId())
            .whitePlayerId(game.getWhitePlayer() != null ? game.getWhitePlayer().getId() : null)
            .whitePlayerName(game.getWhitePlayer() != null ? game.getWhitePlayer().getUsername() : "Guest")
            .blackPlayerId(game.getBlackPlayer() != null ? game.getBlackPlayer().getId() : null)
            .blackPlayerName(game.getBlackPlayer() != null ? game.getBlackPlayer().getUsername() : "Guest")
            .result(game.getResult())
            .finishMethod(game.getFinishMethod())
            .playedAt(game.getPlayedAt())
            .build()
        ).toList();

        return ResponseEntity.ok(history);
    }
}
