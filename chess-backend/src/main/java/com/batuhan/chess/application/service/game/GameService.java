package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.config.audit.AuditableAction;
import com.batuhan.chess.api.controller.GameWebSocketController;
import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.HintResponse;
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
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.cache.annotation.CacheEvict;
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
    private final Map<String, ConcurrentHashMap<Long, Long>> playerHeartbeats = new ConcurrentHashMap<>();

    private final Map<String, Long> lastBroadcastTimes = new ConcurrentHashMap<>();
    private static final long BROADCAST_THROTTLE_MS = 150;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors());

    private Counter moveCounter;

    private static final Long AI_PLAYER_ID = -1L;
    private final StockfishService stockfishService;

    public GameService(GameRepository gameRepository,
                       UserRepository userRepository,
                       EloService eloService,
                       MeterRegistry meterRegistry,
                       RedissonClient redissonClient,
                       LobbyService lobbyService,
                       GameWebSocketController webSocketController,
                       StockfishService stockfishService,
                       @Lazy GameService self) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.eloService = eloService;
        this.meterRegistry = meterRegistry;
        this.redissonClient = redissonClient;
        this.lobbyService = lobbyService;
        this.webSocketController = webSocketController;
        this.stockfishService = stockfishService;
        this.self = self;
    }

    @PostConstruct
    public void initMetrics() {
        meterRegistry.gauge("chess.games.active", activeGames, Map::size);
        moveCounter = Counter.builder("chess.moves.total").register(meterRegistry);
    }

    @PreDestroy
    public void shutdownScheduler() {
        scheduler.shutdownNow();
    }

    private void throttledBroadcast(String gameId, Game game) {
        long now = System.currentTimeMillis();
        Long lastTime = lastBroadcastTimes.get(gameId);

        if (lastTime == null || (now - lastTime) >= BROADCAST_THROTTLE_MS) {
            lastBroadcastTimes.put(gameId, now);
            webSocketController.broadcastGameUpdate(gameId, game);
        }
    }

    public String createGame(Long whiteId, Long blackId) {
        String gameId = UUID.randomUUID().toString().substring(0, 8);
        createNewGameWithPlayers(gameId, whiteId, blackId);
        return gameId;
    }

    public String createAiGame(Long humanUserId, boolean playAsWhite, int difficulty, Integer timeLimit) {
        String gameId = UUID.randomUUID().toString().substring(0, 8);

        Long whiteId = playAsWhite ? humanUserId : AI_PLAYER_ID;
        Long blackId = playAsWhite ? AI_PLAYER_ID : humanUserId;

        createNewGameWithPlayers(gameId, whiteId, blackId, timeLimit != null ? timeLimit : 10);

        if (!playAsWhite) {
            Game game = activeGames.get(gameId);
            if (game != null) {
                triggerAiMoveIfNeededWithDifficulty(gameId, game, difficulty);
            }
        }

        return gameId;
    }

    public HintResponse getEngineHint(String gameId, int depth) {
        Game game = activeGames.get(gameId);
        if (game == null) {
            throw new GameOperationException("Game not found");
        }

        List<String> sanitizedHistory = game.getMoveHistory().stream().map(move -> {
            if (move != null && move.length() > 4) {
                return move.substring(0, 4) + move.substring(4).toLowerCase(Locale.ROOT);
            }
            return move;
        }).toList();

        String bestMove = stockfishService.getBestMove(sanitizedHistory, depth > 0 ? depth : 10);
        int eval = stockfishService.getEvaluation(sanitizedHistory, depth > 0 ? depth : 10);

        if (bestMove == null) {
            throw new GameOperationException("Failed to calculate hint from engine");
        }

        return new HintResponse(bestMove, eval, "Engine calculated best move.");
    }

    private void triggerAiMoveIfNeededWithDifficulty(String gameId, Game game, int difficulty) {
        if (game.getStatus().isFinished()) return;
        Long nextPlayerId = (game.getCurrentTurn() == Color.WHITE) ? game.getWhitePlayerId() : game.getBlackPlayerId();

        if (AI_PLAYER_ID.equals(nextPlayerId)) {
            String bestMoveUci = stockfishService.getBestMove(game.getMoveHistory(), difficulty);

            if (bestMoveUci != null && bestMoveUci.length() >= 4) {
                log.info("AI (Stockfish - With Difficulty) calculated best move for game {}: {}", gameId, bestMoveUci);

                Position from = parseUciPosition(bestMoveUci.substring(0, 2));
                Position to = parseUciPosition(bestMoveUci.substring(2, 4));

                String promotionType = bestMoveUci.length() > 4 ? String.valueOf(bestMoveUci.charAt(4)).toUpperCase() : null;
                game.makeMove(from, to, promotionType);
                throttledBroadcast(gameId, game);

                if (game.getStatus().isFinished()) {
                    self.processGameFinish(gameId, determineResult(game, game.getStatus()), game.getStatus());
                }
            }
        }
    }

    public void createNewGameWithPlayers(String roomId, Long whiteId, Long blackId) {
        LobbyService.GameRoom room = lobbyService.getRoom(roomId);
        int timeLimit = (room != null) ? room.getTimeLimit() : 10;
        createNewGameWithPlayers(roomId, whiteId, blackId, timeLimit);
    }

    public void createNewGameWithPlayers(String roomId, Long whiteId, Long blackId, int timeLimit) {
        activeGames.remove(roomId);
        readyPlayers.remove(roomId);
        lastBroadcastTimes.remove(roomId);
        cancelTimeoutTask(roomId);

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

        playerHeartbeats.computeIfAbsent(gameId, k -> new ConcurrentHashMap<>()).put(userId, System.currentTimeMillis());
        Set<Long> playersInRoom = readyPlayers.get(gameId);

        boolean bothReady;
        if (game.isAiGame()) {
            bothReady = playersInRoom != null && playersInRoom.contains(userId);
        } else {
            bothReady = playersInRoom != null &&
                playersInRoom.contains(game.getWhitePlayerId()) &&
                playersInRoom.contains(game.getBlackPlayerId());
        }

        if (bothReady && game.getLastMoveTimestamp() == null) {
            LobbyService.GameRoom room = lobbyService.getRoom(gameId);
            int timeLimit = (room != null) ? room.getTimeLimit() : 10;

            game.startClock(timeLimit);
            scheduleTimeoutTask(gameId, timeLimit * 60 * 1000L);

            if (game.isAiGame() && AI_PLAYER_ID.equals(game.getBlackPlayerId()) && game.getCurrentTurn() == Color.BLACK) {
                triggerAiMoveIfNeeded(gameId, game);
            }
        }

        throttledBroadcast(gameId, game);
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
        if (game == null) return false;

        Set<Long> ready = readyPlayers.get(gameId);
        if (ready == null || ready.isEmpty()) return false;

        if (game.isAiGame()) {
            return true;
        }

        return ready.size() >= 2;
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

        game.setStatus(currentStatus);

        if (game.getStatus().isFinished()) {
            self.processGameFinish(gameId, determineResult(game, game.getStatus()), game.getStatus());
        } else {
            triggerAiMoveIfNeeded(gameId, game);
        }
        return moves;
    }

    private void triggerAiMoveIfNeeded(String gameId, Game game) {
        if (game.getStatus().isFinished()) return;

        Long nextPlayerId = (game.getCurrentTurn() == Color.WHITE) ? game.getWhitePlayerId() : game.getBlackPlayerId();

        if (AI_PLAYER_ID.equals(nextPlayerId)) {
            long randomDelay = ThreadLocalRandom.current().nextLong(2000, 5001);
            scheduler.schedule(() -> executeAiMove(gameId, game), randomDelay, TimeUnit.MILLISECONDS);
        }
    }

    private void executeAiMove(String gameId, Game game) {
        if (game.getStatus().isFinished()) return;

        String bestMoveUci = stockfishService.getBestMove(game.getMoveHistory(), 10);
        if (bestMoveUci == null || bestMoveUci.length() < 4) return;

        Position from = parseUciPosition(bestMoveUci.substring(0, 2));
        Position to = extractToPosition(bestMoveUci);

        String promotionType = extractPromotionType(bestMoveUci);
        game.makeMove(from, to, promotionType);
        throttledBroadcast(gameId, game);

        if (game.getStatus().isFinished()) {
            self.processGameFinish(gameId, determineResult(game, game.getStatus()), game.getStatus());
        }
    }

    private Position extractToPosition(String bestMoveUci) {
        return parseUciPosition(bestMoveUci.substring(2, 4));
    }

    private String extractPromotionType(String bestMoveUci) {
        if (bestMoveUci.length() > 4) {
            return String.valueOf(bestMoveUci.charAt(4)).toLowerCase(Locale.ROOT);
        }
        return null;
    }

    private Position parseUciPosition(String uciCoord) {
        int col = uciCoord.charAt(0) - 'a';
        int row = Character.getNumericValue(uciCoord.charAt(1)) - 1;
        return new Position(col, row);
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
            return;
        }

        game.setStatus(GameStatus.CLOSING);
        cancelTimeoutTask(gameId);
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
            scheduler.schedule(() -> self.cleanupSession(gameId), 30, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Critical error saving finished game {}: {}", gameId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    @AuditableAction(actionType = "PLAYER_DISMISS_GAME")
    public void processPlayerDismiss(String gameId, Long userId) {
        Game game = activeGames.get(gameId);
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

        self.processGameFinish(gameId, result, GameStatus.ABANDONED);
        self.cleanupSession(gameId);
        playerHeartbeats.remove(gameId);
    }

    @Transactional
    public void cleanupSession(String gameId) {
        cancelTimeoutTask(gameId);
        activeGames.remove(gameId);
        readyPlayers.remove(gameId);
        lastBroadcastTimes.remove(gameId);
        playerHeartbeats.remove(gameId);
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
            .playedAt(LocalDateTime.now())
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

    public Map<String, Game> getActiveGamesMap() {
        return activeGames;
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
        List<GameResponse.ExecutedMove> lastMovesList = new ArrayList<>();
        List<String> history = game.getMoveHistory();

        if (history != null && !history.isEmpty()) {
            String lastMoveUci = history.get(history.size() - 1);

            if (lastMoveUci != null && lastMoveUci.length() >= 4) {
                int fromCol = lastMoveUci.charAt(0) - 'a';
                int fromRow = Character.getNumericValue(lastMoveUci.charAt(1)) - 1;
                int toCol = lastMoveUci.charAt(2) - 'a';
                int toRow = Character.getNumericValue(lastMoveUci.charAt(3)) - 1;
                int currentEval = stockfishService.getEvaluation(history, 10);

                int previousEval = 0;
                if (history.size() > 1) {
                    List<String> previousHistory = history.subList(0, history.size() - 1);
                    previousEval = stockfishService.getEvaluation(previousHistory, 10);
                }

                Color playerWhoMoved = game.getCurrentTurn().opposite();
                String quality = classifyMove(previousEval, currentEval, playerWhoMoved);

                lastMovesList.add(new GameResponse.ExecutedMove(
                    fromCol,
                    fromRow,
                    toCol,
                    toRow,
                    "UNKNOWN",
                    currentEval,
                    quality
                ));
            }
        }

        return new GameResponse(
            gameId,
            game.getBoard().toString(),
            game.getCurrentTurn(),
            game.getStatus(),
            lastMovesList,
            game.getHumanReadableHistory(),
            game.getLastMoveMessage(),
            game.getWhitePlayerId(),
            game.getBlackPlayerId(),
            isGameStarted(gameId),
            game.getWhiteRemainingTimeMs(),
            game.getBlackRemainingTimeMs(),
            (room != null) ? room.getTimeLimit() : 10
        );
    }

    private String classifyMove(int previousEval, int currentEval, Color turn) {
        int diff = (turn == Color.WHITE) ? (previousEval - currentEval) : (currentEval - previousEval);

        if (diff > 300) return "BLUNDER";
        if (diff > 150) return "MISTAKE";
        if (diff > 75) return "INACCURACY";
        return "GOOD";
    }

    public void recordHeartbeat(String gameId, Long userId) {
        if (gameId == null || userId == null) return;
        playerHeartbeats.computeIfAbsent(gameId, k -> new ConcurrentHashMap<>()).put(userId, System.currentTimeMillis());
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
                            self.processGameFinish(entry.getKey(), determineResult(game, GameStatus.TIMEOUT), GameStatus.TIMEOUT);
                        } else {
                            throttledBroadcast(entry.getKey(), game);
                        }
                    }
                }
            }
        }, 1, 1, TimeUnit.SECONDS);
    }

    @PostConstruct
    public void startWatchdogScheduler() {
        scheduler.scheduleAtFixedRate(this.watchdogTask, 1, 1, TimeUnit.SECONDS);
    }

    private final Runnable watchdogTask = () -> {
        long now = System.currentTimeMillis();
        long heartbeatTimeoutThreshold = 10_000;

        for (Map.Entry<String, ConcurrentHashMap<Long, Long>> entry : playerHeartbeats.entrySet()) {
            processGameHeartbeat(entry, now, heartbeatTimeoutThreshold);
        }
    };

    private void processGameHeartbeat(Map.Entry<String, ConcurrentHashMap<Long, Long>> entry, long now, long threshold) {
        String gameId = entry.getKey();
        Game game = activeGames.get(gameId);

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
            playerHeartbeats.remove(gameId);
            return true;
        }
        return false;
    }

    private boolean checkPlayerTimeout(String gameId, Long playerId, Map<Long, Long> timestamps, long now, long threshold, GameResult result) {
        if (playerId != null && timestamps.containsKey(playerId)) {
            long lastHeartbeat = timestamps.get(playerId);
            if (now - lastHeartbeat > threshold) {
                self.processGameFinish(gameId, result, GameStatus.ABANDONED);
                playerHeartbeats.remove(gameId);
                return true;
            }
        }
        return false;
    }
}
