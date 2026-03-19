package com.batuhan.chess.application.service;

import com.batuhan.chess.domain.model.Board;
import com.batuhan.chess.domain.model.Game;
import com.batuhan.chess.domain.model.Position;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {

    private final Map<String, Game> activeGames = new ConcurrentHashMap<>();

    public String createGame() {
        String gameId = UUID.randomUUID().toString();
        Board board = new Board();
        Game newGame = new Game(board);
        activeGames.put(gameId, newGame);
        return gameId;
    }

    public Game makeMove(String gameId, Position from, Position to) {
        Game game = activeGames.get(gameId);
        if (game == null) throw new IllegalArgumentException("Game is not found.");

        boolean moved = game.makeMove(from, to);
        if (!moved) throw new IllegalStateException("Invalid move.");

        return game;
    }

    public Game getGame(String gameId) {
        return activeGames.get(gameId);
    }
}
