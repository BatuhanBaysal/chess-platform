package com.batuhan.chess.application.service;

import com.batuhan.chess.api.dto.GameResponse;
import com.batuhan.chess.domain.model.Board;
import com.batuhan.chess.domain.model.Game;
import com.batuhan.chess.domain.model.Position;
import org.springframework.stereotype.Service;

import java.util.List;
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

    public List<GameResponse.ExecutedMove> makeMove(String gameId, Position from, Position to, String promotionType) {
        Game game = activeGames.get(gameId);
        if (game == null) {
            throw new IllegalArgumentException("Game not found with ID: " + gameId);
        }

        List<GameResponse.ExecutedMove> executedMoves = game.makeMove(from, to, promotionType);
        if (executedMoves.isEmpty()) {
            throw new IllegalStateException("Invalid move or king in safety risk.");
        }

        return executedMoves;
    }

    public Game getGame(String gameId) {
        Game game = activeGames.get(gameId);
        if (game == null) {
            throw new IllegalArgumentException("Game not found.");
        }
        return game;
    }

    public void deleteGame(String gameId) {
        activeGames.remove(gameId);
    }
}
