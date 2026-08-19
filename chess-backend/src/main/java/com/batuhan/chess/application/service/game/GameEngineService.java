package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.HintResponse;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.domain.model.chess.*;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.observation.annotation.Observed;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class GameEngineService {

    private static final Long AI_PLAYER_ID = -1L;

    private final GameSessionManager sessionManager;
    private final GameTimerService timerService;
    private final StockfishService stockfishService;
    private final RedissonClient redissonClient;
    private final GameBroadcastManager broadcastManager;
    private final GameService self;

    private final Counter moveCounter;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors());

    public GameEngineService(GameSessionManager sessionManager,
                             GameTimerService timerService,
                             StockfishService stockfishService,
                             RedissonClient redissonClient,
                             GameBroadcastManager broadcastManager,
                             MeterRegistry meterRegistry,
                             @Lazy GameService self) {
        this.sessionManager = sessionManager;
        this.timerService = timerService;
        this.stockfishService = stockfishService;
        this.redissonClient = redissonClient;
        this.broadcastManager = broadcastManager;
        this.self = self;
        this.moveCounter = Counter.builder("chess.moves.total").register(meterRegistry);
    }

    public HintResponse getEngineHint(String gameId, int depth) {
        Game game = sessionManager.getGame(gameId);
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
        Game game = sessionManager.getGame(gameId);
        if (game == null) throw new GameOperationException("Game not found");

        if (game.getStatus().isFinished()) {
            throw new GameOperationException("Cannot make a move in a finished game");
        }

        game.updateTime();
        if (timerService.isTimeExpired(game)) {
            self.processGameFinish(gameId, timerService.determineResult(game, GameStatus.TIMEOUT), GameStatus.TIMEOUT);
            throw new GameOperationException("Time expired");
        }

        List<Game.ExecutedMoveData> domainMoves = game.makeMove(from, to, promotionType);
        if (domainMoves.isEmpty()) return Collections.emptyList();

        List<GameResponse.ExecutedMove> moves = domainMoves.stream()
            .map(m -> new GameResponse.ExecutedMove(
                m.startFile(), m.startRank(), m.endFile(), m.endRank(), m.pieceType(), null, null
            ))
            .toList();

        timerService.cancelTimeoutTask(gameId);
        long remaining = (game.getCurrentTurn() == Color.WHITE) ? game.getWhiteRemainingTimeMs() : game.getBlackRemainingTimeMs();
        timerService.scheduleTimeoutTask(gameId, Math.max(0, remaining));

        moveCounter.increment();
        GameStatus currentStatus = game.getEvaluator().evaluateStatus(
            game.getBoard(), game.getCurrentTurn(), game.getValidator(),
            game.getHalfMoveClock(), game.getBoardHistory(), game.getLastMove()
        );

        game.setStatus(currentStatus);

        if (game.getStatus().isFinished()) {
            self.processGameFinish(gameId, timerService.determineResult(game, game.getStatus()), game.getStatus());
        } else {
            triggerAiMoveIfNeeded(gameId, game);
        }
        return moves;
    }

    public void triggerAiMoveIfNeeded(String gameId, Game game) {
        if (game.getStatus().isFinished()) return;
        Long nextPlayerId = (game.getCurrentTurn() == Color.WHITE) ? game.getWhitePlayerId() : game.getBlackPlayerId();

        if (AI_PLAYER_ID.equals(nextPlayerId)) {
            long randomDelay = ThreadLocalRandom.current().nextLong(2000, 5001);
            scheduler.schedule(() -> executeAiMove(gameId, game), randomDelay, TimeUnit.MILLISECONDS);
        }
    }

    public void triggerAiMoveIfNeededWithDifficulty(String gameId, Game game, int difficulty) {
        if (game.getStatus().isFinished()) return;
        Long nextPlayerId = (game.getCurrentTurn() == Color.WHITE) ? game.getWhitePlayerId() : game.getBlackPlayerId();

        if (AI_PLAYER_ID.equals(nextPlayerId)) {
            String bestMoveUci = stockfishService.getBestMove(game.getMoveHistory(), difficulty);

            if (bestMoveUci != null && bestMoveUci.length() >= 4) {
                Position from = parseUciPosition(bestMoveUci.substring(0, 2));
                Position to = parseUciPosition(bestMoveUci.substring(2, 4));
                String promo = bestMoveUci.length() > 4 ? String.valueOf(bestMoveUci.charAt(4)).toUpperCase() : null;

                game.makeMove(from, to, promo);

                timerService.cancelTimeoutTask(gameId);
                long remaining = (game.getCurrentTurn() == Color.WHITE) ? game.getWhiteRemainingTimeMs() : game.getBlackRemainingTimeMs();
                timerService.scheduleTimeoutTask(gameId, Math.max(0, remaining));

                broadcastManager.throttledBroadcast(gameId, game);

                if (game.getStatus().isFinished()) {
                    self.processGameFinish(gameId, timerService.determineResult(game, game.getStatus()), game.getStatus());
                }
            }
        }
    }

    private void executeAiMove(String gameId, Game game) {
        if (game.getStatus().isFinished()) return;

        String bestMoveUci = stockfishService.getBestMove(game.getMoveHistory(), 10);
        if (bestMoveUci == null || bestMoveUci.length() < 4) return;

        Position from = parseUciPosition(bestMoveUci.substring(0, 2));
        Position to = parseUciPosition(bestMoveUci.substring(2, 4));
        String promo = bestMoveUci.length() > 4 ? String.valueOf(bestMoveUci.charAt(4)).toLowerCase(Locale.ROOT) : null;

        game.makeMove(from, to, promo);

        timerService.cancelTimeoutTask(gameId);
        long remaining = (game.getCurrentTurn() == Color.WHITE) ? game.getWhiteRemainingTimeMs() : game.getBlackRemainingTimeMs();
        timerService.scheduleTimeoutTask(gameId, Math.max(0, remaining));

        broadcastManager.throttledBroadcast(gameId, game);

        if (game.getStatus().isFinished()) {
            self.processGameFinish(gameId, timerService.determineResult(game, game.getStatus()), game.getStatus());
        }
    }

    private Position parseUciPosition(String uciCoord) {
        int col = uciCoord.charAt(0) - 'a';
        int row = Character.getNumericValue(uciCoord.charAt(1)) - 1;
        return new Position(col, row);
    }
}
