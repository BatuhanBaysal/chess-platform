package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.domain.model.chess.*;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.GameRepository;
import com.batuhan.chess.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final EloService eloService;
    private final Map<String, Game> activeGames = new ConcurrentHashMap<>();

    public String createGame(Long whiteId, Long blackId) {
        String gameId = UUID.randomUUID().toString();
        Board board = new Board();
        Game newGame = new Game(board, whiteId, blackId);
        activeGames.put(gameId, newGame);
        log.info("New game session started with ID: {}. WhitePlayerID: {}, BlackPlayerID: {}", gameId, whiteId, blackId);
        return gameId;
    }

    @Transactional
    public List<GameResponse.ExecutedMove> makeMove(String gameId, Position from, Position to, String promotionType) {
        Game game = activeGames.get(gameId);
        if (game == null) {
            log.error("Move execution failed. Game session {} not found in memory", gameId);
            throw new IllegalArgumentException("Game not found");
        }

        List<GameResponse.ExecutedMove> moves = game.makeMove(from, to, promotionType);
        GameStatus status = game.getStatus();

        if (status.isFinished()) {
            log.info("Game over detected for session {}. Final status: {}", gameId, status);
            GameResult result = determineResult(game, status);
            processGameFinish(gameId, result, status);
        }
        return moves;
    }

    private GameResult determineResult(Game game, GameStatus status) {
        if (status == GameStatus.STALEMATE || status == GameStatus.DRAW) {
            return GameResult.DRAW;
        }
        return (game.getCurrentTurn() == Color.WHITE) ? GameResult.BLACK_WIN : GameResult.WHITE_WIN;
    }

    private void processGameFinish(String gameId, GameResult result, GameStatus finishMethod) {
        Game game = activeGames.get(gameId);
        if (game == null) {
            log.error("ProcessGameFinish failed: Game {} not found in memory", gameId);
            return;
        }

        Long whiteId = game.getWhitePlayerId();
        Long blackId = game.getBlackPlayerId();

        log.info("Finalizing Game Process -> Room: {}, WhiteID: {}, BlackID: {}, Result: {}", gameId, whiteId, blackId, result);

        UserEntity white = findUserSafe(whiteId);
        UserEntity black = findUserSafe(blackId);

        if (white == null) log.warn("Persistence Warning: White player (ID: {}) not found in database.", whiteId);
        if (black == null) log.warn("Persistence Warning: Black player (ID: {}) not found in database.", blackId);

        GameEntity history = GameEntity.builder()
            .whitePlayer(white)
            .blackPlayer(black)
            .result(result)
            .finishMethod(finishMethod)
            .pgnData(game.getHistoryAsPgn())
            .whiteEloBefore(white != null ? white.getEloRating() : 1200)
            .blackEloBefore(black != null ? black.getEloRating() : 1200)
            .build();

        double whiteScore = (result == GameResult.WHITE_WIN) ? 1.0 : (result == GameResult.DRAW ? 0.5 : 0.0);
        double blackScore = 1.0 - whiteScore;

        if (white != null) {
            int oppElo = (black != null) ? black.getEloRating() : 1200;
            int gain = eloService.calculateGain(white.getEloRating(), oppElo, whiteScore);
            updateUserStats(white, result == GameResult.WHITE_WIN, result == GameResult.DRAW);
            white.setEloRating(white.getEloRating() + gain);
            history.setWhiteEloGain(gain);
            userRepository.saveAndFlush(white);
            log.info("Updated White Player stats. New ELO: {}, Total Wins: {}", white.getEloRating(), white.getTotalWins());
        }

        if (black != null) {
            int oppElo = (white != null) ? white.getEloRating() : 1200;
            int gain = eloService.calculateGain(black.getEloRating(), oppElo, blackScore);
            updateUserStats(black, result == GameResult.BLACK_WIN, result == GameResult.DRAW);
            black.setEloRating(black.getEloRating() + gain);
            history.setBlackEloGain(gain);
            userRepository.saveAndFlush(black);
            log.info("Updated Black Player stats. New ELO: {}, Total Wins: {}", black.getEloRating(), black.getTotalWins());
        }

        gameRepository.save(history);
        // activeGames.remove(gameId);
        log.info("Game history record created successfully for room: {}", gameId);
    }

    private UserEntity findUserSafe(Long id) {
        if (id == null || id <= 0) {
            return null;
        }
        return userRepository.findById(id).orElse(null);
    }

    private void updateUserStats(UserEntity user, boolean isWin, boolean isDraw) {
        if (isWin) {
            user.setTotalWins(user.getTotalWins() + 1);
        } else if (isDraw) {
            user.setTotalDraws(user.getTotalDraws() + 1);
        } else {
            user.setTotalLosses(user.getTotalLosses() + 1);
        }
    }

    public Game getGame(String gameId) {
        Game game = activeGames.get(gameId);
        if (game == null) throw new IllegalArgumentException("Game not found.");
        return game;
    }

    public List<GameEntity> getGameHistory(Long userId) {
        return gameRepository.findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc(userId, userId);
    }

    public void initializeGameFromLobby(String roomId, Long whiteId, Long blackId) {
        activeGames.remove(roomId);

        Long finalBlackId = blackId;
        if (finalBlackId == null) {
            finalBlackId = 1L;
            log.info("Test Mode: Black player was null, assigned ID 1 as opponent");
        }

        Game newGame = new Game(new Board(), whiteId, finalBlackId);
        activeGames.put(roomId, newGame);
        log.info("Game initialized -> Room: {}, White: {}, Black: {}", roomId, whiteId, finalBlackId);
    }

    @Transactional
    public void finishAndPersistGame(String gameId, GameResult result, GameStatus finishMethod) {
        processGameFinish(gameId, result, finishMethod);
    }
}
