package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.controller.GameWebSocketController;
import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.domain.model.chess.*;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.GameRepository;
import com.batuhan.chess.domain.repository.UserRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.observation.annotation.Observed;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Slf4j
@Service
public class GameService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final EloService eloService;
    private final MeterRegistry meterRegistry;
    private final RedissonClient redissonClient;
    private final LobbyService lobbyService;
    private final GameWebSocketController webSocketController;
    private final GameService self;

    private final Map<String, Game> activeGames = new ConcurrentHashMap<>();
    private final Map<String, Set<Long>> readyPlayers = new ConcurrentHashMap<>();
    private final Map<String, ScheduledFuture<?>> timeoutTasks = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors());

    private Counter moveCounter;

    public GameService(GameRepository gameRepository,
                       UserRepository userRepository,
                       EloService eloService,
                       MeterRegistry meterRegistry,
                       RedissonClient redissonClient,
                       LobbyService lobbyService,
                       GameWebSocketController webSocketController,
                       @Lazy GameService self) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.eloService = eloService;
        this.meterRegistry = meterRegistry;
        this.redissonClient = redissonClient;
        this.lobbyService = lobbyService;
        this.webSocketController = webSocketController;
        this.self = self;
    }

    @PostConstruct
    public void initMetrics() {
        meterRegistry.gauge("chess.games.active", activeGames, Map::size);
        moveCounter = Counter.builder("chess.moves.total").register(meterRegistry);
    }

    public String createGame(Long whiteId, Long blackId) {
        String gameId = UUID.randomUUID().toString().substring(0, 8);
        createNewGameWithPlayers(gameId, whiteId, blackId);
        return gameId;
    }

    public void createNewGameWithPlayers(String roomId, Long whiteId, Long blackId) {
        activeGames.remove(roomId);
        readyPlayers.remove(roomId);
        cancelTimeoutTask(roomId);

        LobbyService.GameRoom room = lobbyService.getRoom(roomId);
        int timeLimit = (room != null) ? room.getTimeLimit() : 10;

        Game newGame = new Game(new Board());
        newGame.setWhitePlayerId(whiteId);
        newGame.setBlackPlayerId(blackId);

        newGame.setWhiteRemainingTimeMs(timeLimit * 60 * 1000L);
        newGame.setBlackRemainingTimeMs(timeLimit * 60 * 1000L);
        activeGames.put(roomId, newGame);
    }

    public boolean setPlayerReady(String gameId, Long userId) {
        if (gameId == null || userId == null) return false;

        readyPlayers.computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(userId);
        Game game = activeGames.get(gameId);
        if (game == null) return false;

        Set<Long> playersInRoom = readyPlayers.get(gameId);
        boolean bothReady = playersInRoom != null && playersInRoom.contains(game.getWhitePlayerId()) && playersInRoom.contains(game.getBlackPlayerId());

        if (bothReady && game.getLastMoveTimestamp() == null) {
            LobbyService.GameRoom room = lobbyService.getRoom(gameId);
            int timeLimit = (room != null) ? room.getTimeLimit() : 10;

            game.startClock(timeLimit);
            scheduleTimeoutTask(gameId, timeLimit * 60 * 1000L);
        }
        return bothReady;
    }

    private void scheduleTimeoutTask(String gameId, long delayMs) {
        cancelTimeoutTask(gameId);

        ScheduledFuture<?> task = scheduler.schedule(() -> {
            Game game = activeGames.get(gameId);
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

    public boolean isGameStarted(String gameId) {
        Game game = activeGames.get(gameId);
        Set<Long> ready = readyPlayers.get(gameId);
        return game != null && ready != null && ready.size() >= 2;
    }

    @Transactional
    @Observed(name = "chess.moves.metrics")
    @CircuitBreaker(name = "chessService")
    public List<GameResponse.ExecutedMove> makeMove(String gameId, Position from, Position to, String promotionType) {
        RLock lock = redissonClient.getLock("lock:game:" + gameId);
        try {
            if (!lock.tryLock(5, 10, TimeUnit.SECONDS)) throw new GameOperationException("Lock error");
            try {
                return executeMoveUnderLock(gameId, from, to, promotionType);
            } finally {
                lock.unlock();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new GameOperationException("Interrupted", e);
        }
    }

    private List<GameResponse.ExecutedMove> executeMoveUnderLock(String gameId, Position from, Position to, String promotionType) {
        Game game = activeGames.get(gameId);
        if (game == null) throw new GameOperationException("Game not found");

        if (game.getStatus().isFinished()) {
            throw new GameOperationException("Cannot make a move in a finished game");
        }

        game.updateTime();
        if (isTimeExpired(game)) {
            self.processGameFinish(gameId, determineResult(game, GameStatus.TIMEOUT), GameStatus.TIMEOUT);
            throw new GameOperationException("Time expired");
        }

        List<GameResponse.ExecutedMove> moves = game.makeMove(from, to, promotionType);
        if (moves.isEmpty()) return Collections.emptyList();

        cancelTimeoutTask(gameId);
        long remaining = (game.getCurrentTurn() == Color.WHITE) ? game.getWhiteRemainingTimeMs() : game.getBlackRemainingTimeMs();
        scheduleTimeoutTask(gameId, Math.max(0, remaining));

        moveCounter.increment();
        GameStatus currentStatus = game.getEvaluator().evaluateStatus(
            game.getBoard(),
            game.getCurrentTurn(),
            game.getValidator(),
            game.getHalfMoveClock(),
            game.getBoardHistory(),
            game.getLastMove()
        );

        log.info("DEBUG-MOVE: GameId: {}, Detected Status: {}, IsFinished: {}", gameId, currentStatus, currentStatus.isFinished());
        game.setStatus(currentStatus);

        if (game.getStatus().isFinished()) {
            log.info("DEBUG-MOVE: Checkmate triggered, calling processGameFinish!");
            self.processGameFinish(gameId, determineResult(game, game.getStatus()), game.getStatus());
        } else {
            log.warn("DEBUG-MOVE: Status not finished, processGameFinish skipped!");
        }
        return moves;
    }

    private boolean isTimeExpired(Game game) {
        return (game.getCurrentTurn() == Color.WHITE ? game.getWhiteRemainingTimeMs() : game.getBlackRemainingTimeMs()) <= 0;
    }

    private void cancelTimeoutTask(String gameId) {
        ScheduledFuture<?> task = timeoutTasks.remove(gameId);
        if (task != null) task.cancel(true);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processGameFinish(String gameId, GameResult result, GameStatus finishMethod) {
        Game game = activeGames.get(gameId);
        if (game == null) return;

        if (game.getStatus() == GameStatus.CLOSING) {
            log.warn("Game {} is already closing, skipping duplicate finish.", gameId);
            return;
        }

        log.info("Processing finish for game: {}, method: {}, result: {}", gameId, finishMethod, result);
        game.setStatus(GameStatus.CLOSING);

        cancelTimeoutTask(gameId);
        self.handleFinishLogic(gameId, game, result, finishMethod);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleFinishLogic(String gameId, Game game, GameResult result, GameStatus finishMethod) {
        log.info("--- [DEBUG] handleFinishLogic started. GameId: {}", gameId);
        try {
            game.setStatus(finishMethod);
            UserEntity white = findUserSafe(game.getWhitePlayerId());
            UserEntity black = findUserSafe(game.getBlackPlayerId());

            log.info("--- [DEBUG] Players found. White: {}, Black: {}", white != null ? white.getId() : "NULL", black != null ? black.getId() : "NULL");
            GameEntity history = buildGameEntity(game, white, black, result, finishMethod);

            log.info("--- [DEBUG] Entering Elo calculation...");
            applyEloChanges(white, black, result, history);
            log.info("--- [DEBUG] Elo calculated.");
            gameRepository.saveAndFlush(history);
            log.info("--- [DEBUG] Written to database!");

            webSocketController.broadcastGameUpdate(gameId, game);
            webSocketController.sendGameOver(gameId, result);
            scheduler.schedule(() -> self.cleanupSession(gameId), 30, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("--- [DEBUG] CRITICAL ERROR! Game {} could not be saved. Error: {}", gameId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void cleanupSession(String gameId) {
        cancelTimeoutTask(gameId);
        activeGames.remove(gameId);
        readyPlayers.remove(gameId);
        log.info("Session cleaned up for game: {}", gameId);
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
            .playedAt(LocalDateTime.now())
            .build();
    }

    private void applyEloChanges(UserEntity white, UserEntity black, GameResult result, GameEntity history) {
        if (white != null && black != null) {
            double whiteScore = getScoreFromResult(result);
            int wGain = eloService.calculateGain(white.getEloRating(), black.getEloRating(), whiteScore);
            int bGain = eloService.calculateGain(black.getEloRating(), white.getEloRating(), 1.0 - whiteScore);
            white.setEloRating(white.getEloRating() + wGain);
            black.setEloRating(black.getEloRating() + bGain);
            userRepository.save(white);
            userRepository.save(black);
            history.setWhiteEloGain(wGain);
            history.setBlackEloGain(bGain);
            log.info("Elo updated. White: {} ({}), Black: {} ({})", white.getUsername(), wGain, black.getUsername(), bGain);
        }
    }

    public String getActiveGameIdByUserId(Long userId) {
        return activeGames.entrySet().stream()
            .filter(entry -> entry.getValue().getWhitePlayerId().equals(userId) || entry.getValue().getBlackPlayerId().equals(userId))
            .filter(entry -> !entry.getValue().getStatus().isFinished())
            .map(Map.Entry::getKey)
            .findFirst()
            .orElse(null);
    }

    public GameResult determineResult(Game game, GameStatus status) {
        if (status == GameStatus.STALEMATE || status == GameStatus.DRAW) return GameResult.DRAW;
        return (game.getCurrentTurn() == Color.WHITE) ? GameResult.BLACK_WIN : GameResult.WHITE_WIN;
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

    public Game getGame(String gameId) {
        return activeGames.get(gameId);
    }

    @Transactional(readOnly = true)
    public List<GameEntity> getGameHistory(Long userId) {
        if (userId == null || userId <= 0) return Collections.emptyList();
        return gameRepository.findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc(userId, userId);
    }

    public GameResponse convertToResponse(String gameId, Game game) {
        LobbyService.GameRoom room = lobbyService.getRoom(gameId);
        return new GameResponse(gameId, game.getBoard().toString(), game.getCurrentTurn(), game.getStatus(), Collections.emptyList(),
            game.getHumanReadableHistory(), game.getLastMoveMessage(), game.getWhitePlayerId(), game.getBlackPlayerId(),
            isGameStarted(gameId), game.getWhiteRemainingTimeMs(), game.getBlackRemainingTimeMs(), (room != null) ? room.getTimeLimit() : 10);
    }

    @PostConstruct
    public void startGlobalTimer() {
        scheduler.scheduleAtFixedRate(() -> {
            for (Map.Entry<String, Game> entry : new HashSet<>(activeGames.entrySet())) {
                Game game = entry.getValue();
                if (game != null && !game.getStatus().isFinished()) {
                    synchronized (game) {
                        game.updateTime();
                        if (isTimeExpired(game)) {
                            log.info("Global timer triggered timeout for game: {}", entry.getKey());
                            self.processGameFinish(entry.getKey(), determineResult(game, GameStatus.TIMEOUT), GameStatus.TIMEOUT);
                        } else {
                            webSocketController.broadcastGameUpdate(entry.getKey(), game);
                        }
                    }
                }
            }
        }, 1, 1, TimeUnit.SECONDS);
    }
}
