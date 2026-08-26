package com.batuhan.chess.application.service.game;

import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameResult;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Map;
import java.util.concurrent.*;

@Slf4j
@Component
public class GameTimerService {

    private final GameSessionManager sessionManager;
    private final GameBroadcastManager gameBroadcastManager;
    private final GameService self;

    private final Map<String, ScheduledFuture<?>> timeoutTasks = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors());

    public GameTimerService(GameSessionManager sessionManager,
                            GameBroadcastManager gameBroadcastManager,
                            @Lazy GameService self) {
        this.sessionManager = sessionManager;
        this.gameBroadcastManager = gameBroadcastManager;
        this.self = self;
    }

    @PreDestroy
    public void shutdownScheduler() {
        scheduler.shutdownNow();
    }

    public void scheduleTimeoutTask(String gameId, long delayMs) {
        cancelTimeoutTask(gameId);

        ScheduledFuture<?> task = scheduler.schedule(() -> {
            Game game = sessionManager.getActiveGames().get(gameId);
            if (game == null || game.getStatus().isFinished()) return;

            synchronized (game) {
                game.updateTime();
                if (isTimeExpired(game)) {
                    self.processGameFinish(gameId, determineResult(game, GameStatus.TIMEOUT), GameStatus.TIMEOUT);
                }
            }
        }, delayMs, TimeUnit.MILLISECONDS);

        timeoutTasks.put(gameId, task);
    }

    public void cancelTimeoutTask(String gameId) {
        ScheduledFuture<?> task = timeoutTasks.remove(gameId);
        if (task != null) task.cancel(true);
    }

    public boolean isTimeExpired(Game game) {
        return (game.getCurrentTurn() == com.batuhan.chess.domain.model.chess.Color.WHITE ? game.getWhiteRemainingTimeMs() : game.getBlackRemainingTimeMs()) <= 0;
    }

    public GameResult determineResult(Game game, GameStatus status) {
        if (status == GameStatus.STALEMATE || status == GameStatus.DRAW) return GameResult.DRAW;
        return (game.getCurrentTurn() == com.batuhan.chess.domain.model.chess.Color.WHITE) ? GameResult.BLACK_WIN : GameResult.WHITE_WIN;
    }

    @PostConstruct
    public void startGlobalTimer() {
        scheduler.scheduleAtFixedRate(() -> {
            Map<String, Game> activeGames = sessionManager.getActiveGames();
            for (Map.Entry<String, Game> entry : new HashSet<>(activeGames.entrySet())) {
                Game game = entry.getValue();
                if (game != null && !game.getStatus().isFinished()) {
                    synchronized (game) {
                        game.updateTime();
                        if (isTimeExpired(game)) {
                            self.processGameFinish(entry.getKey(), determineResult(game, GameStatus.TIMEOUT), GameStatus.TIMEOUT);
                        } else {
                            gameBroadcastManager.throttledBroadcast(entry.getKey(), game);
                        }
                    }
                }
            }
        }, 1, 1, TimeUnit.SECONDS);
    }

    @PostConstruct
    public void startWatchdogScheduler() {
        scheduler.scheduleAtFixedRate(this::runWatchdog, 50, 50, TimeUnit.SECONDS);
    }

    private void runWatchdog() {
        long now = System.currentTimeMillis();
        long heartbeatTimeoutThreshold = 60_000;

        Map<String, ConcurrentHashMap<Long, Long>> heartbeats = sessionManager.getPlayerHeartbeats();
        for (Map.Entry<String, ConcurrentHashMap<Long, Long>> entry : heartbeats.entrySet()) {
            processGameHeartbeat(entry, now, heartbeatTimeoutThreshold);
        }
    }

    private void processGameHeartbeat(Map.Entry<String, ConcurrentHashMap<Long, Long>> entry, long now, long threshold) {
        String gameId = entry.getKey();
        Game game = sessionManager.getActiveGames().get(gameId);

        if (isGameInvalidOrFinished(gameId, game)) {
            return;
        }

        ConcurrentHashMap<Long, Long> timestamps = entry.getValue();
        boolean whiteTimedOut = checkPlayerTimeout(gameId, game.getWhitePlayerId(), timestamps, now, threshold, GameResult.BLACK_WIN);

        if (!whiteTimedOut) {
            checkPlayerTimeout(gameId, game.getBlackPlayerId(), timestamps, now, threshold, GameResult.WHITE_WIN);
        }
    }

    private boolean isGameInvalidOrFinished(String gameId, Game game) {
        if (game == null || game.getStatus().isFinished() || game.getStatus() == GameStatus.CLOSING) {
            sessionManager.getPlayerHeartbeats().remove(gameId);
            return true;
        }
        return false;
    }

    private boolean checkPlayerTimeout(String gameId, Long playerId, Map<Long, Long> timestamps, long now, long threshold, GameResult result) {
        if (playerId != null && timestamps.containsKey(playerId)) {
            long lastHeartbeat = timestamps.get(playerId);
            if (now - lastHeartbeat > threshold) {
                self.processGameFinish(gameId, result, GameStatus.ABANDONED);
                sessionManager.getPlayerHeartbeats().remove(gameId);
                return true;
            }
        }
        return false;
    }
}
