package com.batuhan.chess.identity.api.controller;

import com.batuhan.chess.identity.api.dto.game.GameResponse;
import com.batuhan.chess.identity.application.service.GameService;
import com.batuhan.chess.identity.domain.model.Game;
import com.batuhan.chess.identity.domain.model.Position;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class GameRestController {

    private final GameService gameService;

    @PostMapping
    public GameResponse createGame() {
        String gameId = gameService.createGame();
        Game game = gameService.getGame(gameId);

        return new GameResponse(
            gameId,
            game.getBoard().toString(),
            game.getCurrentTurn(),
            game.getStatus(),
            List.of(),
            List.of(),
            game.getLastMoveMessage()
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
}
