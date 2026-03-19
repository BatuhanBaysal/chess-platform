package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.GameResponse;
import com.batuhan.chess.application.service.GameService;
import com.batuhan.chess.domain.model.Game;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameRestController {

    private final GameService gameService;

    @PostMapping
    public GameResponse createGame() {
        String gameId = gameService.createGame();
        Game game = gameService.getGame(gameId);
        return new GameResponse(gameId, game.getBoard().toString(), game.getCurrentTurn(), game.getStatus());
    }
}
