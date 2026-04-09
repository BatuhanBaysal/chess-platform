package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.game.GameHistory;
import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.Position;
import com.batuhan.chess.domain.model.history.GameEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    public GameResponse getGame(@PathVariable String gameId,
                                @RequestParam(required = false) Long blackId) {
        log.info("Fetching game context for ID: {}, Rejoining Player: {}", gameId, blackId);

        Game game = gameService.getGame(gameId);

        return new GameResponse(
            gameId,
            game.getBoard().toString(),
            game.getCurrentTurn(),
            game.getStatus(),
            List.of(),
            game.getHumanReadableHistory(),
            game.getLastMoveMessage(),
            game.getWhitePlayerId(),
            game.getBlackPlayerId()
        );
    }

    @PostMapping
    public GameResponse createGame(
        @RequestParam(value = "whiteId", required = false) Long whiteId,
        @RequestParam(value = "blackId", required = false) Long blackId) {

        log.info("New Game Request - WhiteID: {}, BlackID: {}", whiteId, blackId);

        String gameId = gameService.createGame(whiteId, blackId);
        Game game = gameService.getGame(gameId);

        return new GameResponse(
            gameId,
            game.getBoard().toString(),
            game.getCurrentTurn(),
            game.getStatus(),
            List.of(),
            List.of(),
            game.getLastMoveMessage(),
            whiteId,
            blackId
        );
    }

    @GetMapping("/{gameId}/legal-moves")
    public List<Position> getLegalMoves(
        @PathVariable String gameId,
        @RequestParam int file,
        @RequestParam int rank) {

        Game game = gameService.getGame(gameId);
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
