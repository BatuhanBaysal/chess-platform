package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.domain.model.chess.*;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.GameRepository;
import com.batuhan.chess.domain.repository.UserRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final EloService eloService;
    private final MeterRegistry meterRegistry;

    private final Map<String, Game> activeGames = new ConcurrentHashMap<>();
    private final Map<String, Set<Long>> readyPlayers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    private Counter moveCounter;

    @PostConstruct
    public void initMetrics() {
        meterRegistry.gauge("chess.games.active", activeGames, Map::size);
        moveCounter = Counter.builder("chess.moves.total")
            .description("Total number of chess moves executed")
            .register(meterRegistry);
    }

    public String createGame(Long whiteId, Long blackId) {
        String gameId = UUID.randomUUID().toString().substring(0, 8);
        createNewGameWithPlayers(gameId, whiteId, blackId);
        return gameId;
    }

    public void createNewGameWithPlayers(String roomId, Long whiteId, Long blackId) {
        activeGames.remove(roomId);
        readyPlayers.remove(roomId);

        Board board = new Board();
        Game newGame = new Game(board);
        newGame.setWhitePlayerId(whiteId);
        newGame.setBlackPlayerId(blackId);

        activeGames.put(roomId, newGame);
        log.info("Multiplayer Game Session initialized! Room ID: {}, White: {}, Black: {}",
            roomId, whiteId, blackId);
    }

    public boolean setPlayerReady(String gameId, Long userId) {
        readyPlayers.computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(userId);
        Game game = activeGames.get(gameId);
        if (game == null) return false;

        return readyPlayers.get(gameId).contains(game.getWhitePlayerId()) &&
            readyPlayers.get(gameId).contains(game.getBlackPlayerId());
    }

    public boolean isGameStarted(String gameId) {
        Game game = activeGames.get(gameId);
        if (game == null) return false;
        Set<Long> ready = readyPlayers.get(gameId);
        return ready != null && ready.size() >= 2;
    }

    @Transactional
    public List<GameResponse.ExecutedMove> makeMove(String gameId, Position from, Position to, String promotionType) {
        Game game = activeGames.get(gameId);
        if (game == null) throw new IllegalArgumentException("Game not found");

        if (!isGameStarted(gameId)) {
            throw new IllegalStateException("Game has not started yet.");
        }

        synchronized (game) {
            if (game.getStatus().isFinished()) {
                throw new IllegalStateException("Cannot make a move in a finished game.");
            }

            List<GameResponse.ExecutedMove> moves = game.makeMove(from, to, promotionType);
            if (moves.isEmpty()) {
                return Collections.emptyList();
            }

            moveCounter.increment();

            if (game.getStatus().isFinished() && game.getStatus() != GameStatus.CLOSING) {
                processGameFinish(gameId, determineResult(game, game.getStatus()), game.getStatus());
            }
            return moves;
        }
    }

    private GameResult determineResult(Game game, GameStatus status) {
        if (status == GameStatus.STALEMATE || status == GameStatus.DRAW) return GameResult.DRAW;
        return (game.getCurrentTurn() == Color.WHITE) ? GameResult.BLACK_WIN : GameResult.WHITE_WIN;
    }

    @Transactional
    public void processGameFinish(String gameId, GameResult result, GameStatus finishMethod) {
        Game game = activeGames.get(gameId);
        if (game == null || game.getStatus() == GameStatus.CLOSING) return;

        synchronized (game) {
            if (game.getStatus() == GameStatus.CLOSING) return;
            game.setStatus(finishMethod);

            UserEntity white = findUserSafe(game.getWhitePlayerId());
            UserEntity black = findUserSafe(game.getBlackPlayerId());

            GameEntity history = buildGameEntity(game, white, black, result, finishMethod);
            applyEloChanges(white, black, result, history);

            gameRepository.save(history);
            scheduler.schedule(() -> {
                Game g = activeGames.get(gameId);
                if (g != null) g.setStatus(GameStatus.CLOSING);
                activeGames.remove(gameId);
                readyPlayers.remove(gameId);
                log.info("Game session {} cleanup completed.", gameId);
            }, 30, TimeUnit.SECONDS);
        }
    }

    private GameEntity buildGameEntity(Game game, UserEntity white, UserEntity black, GameResult result, GameStatus method) {
        String pgnData = String.join(" ", game.getHumanReadableHistory());
        return GameEntity.builder()
            .whitePlayer(white).blackPlayer(black)
            .result(result).finishMethod(method).pgnData(pgnData)
            .whiteEloBefore(white != null ? white.getEloRating() : 1200)
            .blackEloBefore(black != null ? black.getEloRating() : 1200)
            .build();
    }

    private void applyEloChanges(UserEntity white, UserEntity black, GameResult result, GameEntity history) {
        if (white != null && black != null) {
            double whiteScore = (result == GameResult.WHITE_WIN) ? 1.0 : (result == GameResult.DRAW ? 0.5 : 0.0);
            double blackScore = 1.0 - whiteScore;
            int whiteGain = eloService.calculateGain(white.getEloRating(), black.getEloRating(), whiteScore);
            int blackGain = eloService.calculateGain(black.getEloRating(), white.getEloRating(), blackScore);
            updateUserStats(white, result == GameResult.WHITE_WIN, result == GameResult.DRAW);
            updateUserStats(black, result == GameResult.BLACK_WIN, result == GameResult.DRAW);
            white.setEloRating(white.getEloRating() + whiteGain);
            black.setEloRating(black.getEloRating() + blackGain);
            history.setWhiteEloGain(whiteGain);
            history.setBlackEloGain(blackGain);
            userRepository.save(white);
            userRepository.save(black);
        }
    }

    private UserEntity findUserSafe(Long id) {
        return (id == null || id <= 0) ? null : userRepository.findById(id).orElse(null);
    }

    private void updateUserStats(UserEntity user, boolean isWin, boolean isDraw) {
        if (isWin) user.setTotalWins(user.getTotalWins() + 1);
        else if (isDraw) user.setTotalDraws(user.getTotalDraws() + 1);
        else user.setTotalLosses(user.getTotalLosses() + 1);
    }

    public Game getGame(String gameId) {
        return activeGames.get(gameId);
    }

    @Transactional(readOnly = true)
    public List<GameEntity> getGameHistory(Long userId) {
        return gameRepository.findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc(userId, userId);
    }
}
