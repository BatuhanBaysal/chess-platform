package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.config.audit.AuditableAction;
import com.batuhan.chess.api.controller.GameWebSocketController;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.GameRepository;
import com.batuhan.chess.domain.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class GamePersistenceService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final EloService eloService;
    private final GameSessionManager sessionManager;
    private final GameTimerService timerService;
    private final GameWebSocketController webSocketController;
    private final GameService self;
    private final GamePersistenceService persistenceSelf;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors());

    public GamePersistenceService(GameRepository gameRepository,
                                  UserRepository userRepository,
                                  EloService eloService,
                                  GameSessionManager sessionManager,
                                  GameTimerService timerService,
                                  GameWebSocketController webSocketController,
                                  @Lazy GameService self,
                                  @Lazy GamePersistenceService persistenceSelf) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.eloService = eloService;
        this.sessionManager = sessionManager;
        this.timerService = timerService;
        this.webSocketController = webSocketController;
        this.self = self;
        this.persistenceSelf = persistenceSelf;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processGameFinish(String gameId, GameResult result, GameStatus finishMethod) {
        Game game = sessionManager.getGame(gameId);
        if (game == null) return;

        if (game.getStatus() == GameStatus.CLOSING) {
            return;
        }

        game.setStatus(GameStatus.CLOSING);
        timerService.cancelTimeoutTask(gameId);
        self.handleFinishLogic(gameId, game, result, finishMethod);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleFinishLogic(String gameId, Game game, GameResult result, GameStatus finishMethod) {
        try {
            game.setStatus(finishMethod);
            UserEntity white = findUserSafe(game.getWhitePlayerId());
            UserEntity black = findUserSafe(game.getBlackPlayerId());

            GameEntity history = buildGameEntity(game, white, black, result, finishMethod);
            applyEloChanges(white, black, result, history);
            gameRepository.saveAndFlush(history);

            webSocketController.broadcastGameUpdate(gameId, game);
            webSocketController.sendGameOver(gameId, result);
            scheduler.schedule(() -> persistenceSelf.cleanupSession(gameId), 30, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Critical error saving finished game {}: {}", gameId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    @AuditableAction(actionType = "PLAYER_DISMISS_GAME")
    public void processPlayerDismiss(String gameId, Long userId) {
        Game game = sessionManager.getGame(gameId);
        if (game == null || game.getStatus().isFinished()) {
            return;
        }

        GameResult result;
        if (userId.equals(game.getWhitePlayerId())) {
            result = GameResult.BLACK_WIN;
        } else if (userId.equals(game.getBlackPlayerId())) {
            result = GameResult.WHITE_WIN;
        } else {
            return;
        }

        persistenceSelf.processGameFinish(gameId, result, GameStatus.ABANDONED);
        persistenceSelf.cleanupSession(gameId);
    }

    @Transactional
    public void cleanupSession(String gameId) {
        timerService.cancelTimeoutTask(gameId);
        sessionManager.removeGame(gameId);
        log.info("Session and resources cleaned up for game: {}", gameId);
    }

    private GameEntity buildGameEntity(Game game, UserEntity white, UserEntity black, GameResult result, GameStatus method) {
        return GameEntity.builder()
            .whitePlayer(white)
            .blackPlayer(black)
            .result(result)
            .finishMethod(method)
            .pgnData(String.join(" ", game.getHumanReadableHistory()))
            .whiteEloBefore(white != null ? white.getEloRating() : 1200)
            .blackEloBefore(black != null ? black.getEloRating() : 1200)
            .playedAt(LocalDateTime.now(ZoneId.systemDefault()))
            .build();
    }

    @CacheEvict(value = "users", key = "#white.username")
    private void applyEloChanges(UserEntity white, UserEntity black, GameResult result, GameEntity history) {
        if (white != null && black != null) {
            double whiteScore = getScoreFromResult(result);
            int wGain = eloService.calculateGain(white.getEloRating(), black.getEloRating(), whiteScore);
            int bGain = eloService.calculateGain(black.getEloRating(), white.getEloRating(), 1.0 - whiteScore);

            white.setEloRating(white.getEloRating() + wGain);
            black.setEloRating(black.getEloRating() + bGain);

            if (result == GameResult.WHITE_WIN) {
                white.setTotalWins(white.getTotalWins() + 1);
                black.setTotalLosses(black.getTotalLosses() + 1);
            } else if (result == GameResult.BLACK_WIN) {
                black.setTotalWins(black.getTotalWins() + 1);
                white.setTotalLosses(white.getTotalLosses() + 1);
            } else {
                white.setTotalDraws(white.getTotalDraws() + 1);
                black.setTotalDraws(black.getTotalDraws() + 1);
            }

            userRepository.save(white);
            userRepository.save(black);

            history.setWhiteEloGain(wGain);
            history.setBlackEloGain(bGain);
        }
    }

    private double getScoreFromResult(GameResult result) {
        return switch (result) {
            case WHITE_WIN -> 1.0;
            case DRAW -> 0.5;
            default -> 0.0;
        };
    }

    private UserEntity findUserSafe(Long id) {
        return (id == null || id <= 0) ? null : userRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<GameEntity> getGameHistory(Long userId) {
        if (userId == null || userId <= 0) return Collections.emptyList();
        return gameRepository.findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc(userId, userId);
    }
}
