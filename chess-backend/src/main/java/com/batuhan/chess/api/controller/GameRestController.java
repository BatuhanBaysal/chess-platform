package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.game.GameHistory;
import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.Position;
import com.batuhan.chess.domain.model.history.GameEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class GameRestController {

    private final GameService gameService;

    @GetMapping("/{gameId}")
    public GameResponse getGame(@PathVariable String gameId) {
        Game game = gameService.getGame(gameId);
        if (game == null) {
            throw new ResourceNotFoundException("Game session not found with id: " + gameId);
        }
        return gameService.convertToResponse(gameId, game);
    }

    @GetMapping("/active/{userId}")
    public ResponseEntity<GameResponse> getActiveGame(@PathVariable Long userId) {
        log.info("Checking active game for user ID: {}", userId);
        String gameId = gameService.getActiveGameIdByUserId(userId);
        Game game = gameService.getGame(gameId);

        if (game == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(gameService.convertToResponse(gameId, game));
    }

    @PostMapping
    public GameResponse createGame(
        @RequestParam(value = "whiteId", required = false) Long whiteId,
        @RequestParam(value = "blackId", required = false) Long blackId) {

        String gameId = gameService.createGame(whiteId, blackId);
        Game game = gameService.getGame(gameId);

        if (game == null) throw new ResourceNotFoundException("Failed to initialize game.");
        return gameService.convertToResponse(gameId, game);
    }

    @PostMapping("/{gameId}/finish")
    public ResponseEntity<Void> finishGame(@PathVariable String gameId) {
        log.info("[FINISH] End-of-game request received: {}", gameId);

        Game game = gameService.getGame(gameId);

        if (game == null) {
            log.warn("[FINISH] Game not found: {}", gameId);
            return ResponseEntity.notFound().build();
        }

        if (!game.getStatus().isFinished()) {
            gameService.processGameFinish(
                gameId,
                gameService.determineResult(game, game.getStatus()),
                game.getStatus()
            );
            log.info("[FINISH] The game has been successfully saved to the database: {}", gameId);
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{gameId}/legal-moves")
    public List<Position> getLegalMoves(
        @PathVariable String gameId,
        @RequestParam int file,
        @RequestParam int rank) {

        Game game = gameService.getGame(gameId);
        if (game == null) {
            throw new ResourceNotFoundException("Game not found: " + gameId);
        }

        if (!gameService.isGameStarted(gameId)) {
            return List.of();
        }

        Position startPos = new Position(file, rank);
        return game.getLegalMovesForSquare(startPos);
    }

    @GetMapping("/history/{userId}")
    public List<GameHistory> getPlayerHistory(@PathVariable Long userId) {
        List<GameEntity> games = gameService.getGameHistory(userId);

        return games.stream().map(game -> GameHistory.builder()
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
    }
}
