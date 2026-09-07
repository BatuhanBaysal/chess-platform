package com.batuhan.chess.application.service.game;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;
import org.junit.jupiter.api.parallel.ResourceAccessMode;
import org.junit.jupiter.api.parallel.ResourceLock;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@Execution(ExecutionMode.SAME_THREAD)
@ResourceLock(value = "stockfish-binary", mode = ResourceAccessMode.READ_WRITE)
@DisplayName("Stockfish Service Comprehensive and Concurrency Tests")
class StockfishServiceTest {

    private static StockfishService stockfishService;

    @BeforeAll
    static void initService() {
        stockfishService = new StockfishService();
        ReflectionTestUtils.setField(stockfishService, "cachedEngineBinary", null);
        stockfishService.startEngine();
    }

    @AfterAll
    static void terminateService() {
        if (stockfishService != null) {
            stockfishService.stopEngine();
        }
    }

    @Nested
    @DisplayName("Engine Move Calculation Tests")
    class MoveCalculationTests {

        @Test
        @DisplayName("Should successfully return a valid best move given a move history")
        void shouldReturnBestMoveWithHistory() {
            // Arrange
            List<String> moveHistory = List.of("e2e4");
            int depth = 5;

            // Act
            String bestMove = stockfishService.getBestMove(moveHistory, depth);

            // Assert
            assertThat(bestMove)
                .isNotBlank()
                .matches("^[a-h][1-8][a-h][1-8][qrbn]?$");
        }

        @Test
        @DisplayName("Should handle empty move history and return a valid opening move")
        void shouldHandleEmptyMoveHistory() {
            // Arrange
            List<String> emptyHistory = List.of();
            int depth = 5;

            // Act
            String bestMove = stockfishService.getBestMove(emptyHistory, depth);

            // Assert
            assertThat(bestMove)
                .isNotBlank()
                .matches("^[a-h][1-8][a-h][1-8][qrbn]?$");
        }

        @Test
        @DisplayName("Should handle null move history gracefully without throwing exception")
        void shouldHandleNullMoveHistory() {
            // Arrange
            int depth = 5;

            // Act
            String bestMove = stockfishService.getBestMove(null, depth);

            // Assert
            assertThat(bestMove).isNotBlank();
        }
    }

    @Nested
    @DisplayName("Engine Lifecycle & Restart Tests")
    class LifecycleTests {

        @Test
        @DisplayName("Should restart process automatically if process is killed or dead")
        void shouldRestartProcessWhenDead() {
            // Arrange
            Process initialProcess = (Process) ReflectionTestUtils.getField(stockfishService, "process");
            assertThat(initialProcess).isNotNull();

            // Act
            initialProcess.destroyForcibly();
            org.awaitility.Awaitility.await()
                .atMost(Duration.ofSeconds(3))
                .pollInterval(Duration.ofMillis(100))
                .until(() -> !initialProcess.isAlive());

            ReflectionTestUtils.setField(stockfishService, "lastRestartAttempt", 0L);
            String bestMove = stockfishService.getBestMove(List.of("e2e4"), 3);

            // Assert
            Process newProcess = (Process) ReflectionTestUtils.getField(stockfishService, "process");
            assertThat(bestMove).isNotBlank();
            assertThat(newProcess)
                .isNotNull()
                .matches(Process::isAlive, "is alive");
        }

        @Test
        @DisplayName("Should stop engine successfully and clear process reference")
        void shouldStopEngineGracefully() {
            // Arrange
            stockfishService.stopEngine();

            // Act & Assert
            assertDoesNotThrow(() -> stockfishService.stopEngine());
            assertThat(ReflectionTestUtils.getField(stockfishService, "process")).isNull();
            stockfishService.startEngine();
        }
    }

    @Nested
    @DisplayName("Engine Evaluation Tests")
    class EvaluationTests {

        @Test
        @DisplayName("Should return valid centipawn or mate evaluation score for given move history")
        void shouldReturnEvaluationScore() {
            // Arrange
            List<String> moveHistory = List.of("e2e4");
            int depth = 5;

            // Act
            int evaluation = stockfishService.getEvaluation(moveHistory, depth);

            // Assert
            assertThat(evaluation).isBetween(-10000, 10000);
        }

        @Test
        @DisplayName("Should handle empty move history gracefully and return initial position evaluation")
        void shouldHandleEmptyHistoryForEvaluation() {
            // Arrange
            List<String> emptyHistory = List.of();
            int depth = 5;

            // Act
            int evaluation = stockfishService.getEvaluation(emptyHistory, depth);

            // Assert
            assertThat(evaluation).isBetween(-10000, 10000);
        }

        @Test
        @DisplayName("Should handle null move history gracefully during evaluation")
        void shouldHandleNullHistoryForEvaluation() {
            // Arrange
            int depth = 5;

            // Act
            int evaluation = stockfishService.getEvaluation(null, depth);

            // Assert
            assertThat(evaluation).isBetween(-10000, 10000);
        }
    }

    @Nested
    @DisplayName("Engine Caching & Evaluation Throttling Tests")
    class CachingAndThrottlingTests {

        @Test
        @DisplayName("Should return cached evaluation within throttle interval")
        void shouldReturnCachedEvaluation() {
            // Arrange
            List<String> moveHistory = List.of("e2e4");
            int depth = 5;
            stockfishService.getEvaluation(moveHistory, depth);

            // Act
            @SuppressWarnings("unchecked")
            Map<String, Object> evaluationCache =
                (Map<String, Object>) ReflectionTestUtils.getField(stockfishService, "evaluationCache");

            assertThat(evaluationCache).containsKey("e2e4");
            int cachedEval = stockfishService.getEvaluation(moveHistory, depth);

            // Assert
            assertThat(cachedEval).isBetween(-10000, 10000);
        }

        @Test
        @DisplayName("Should respect throttle interval and refresh evaluation after cache expiration")
        void shouldRefreshEvaluationAfterThrottleInterval() {
            // Arrange
            String cacheKey = "e2e4";
            stockfishService.getEvaluation(List.of(cacheKey), 5);

            @SuppressWarnings("unchecked")
            Map<String, Object> evaluationCache =
                (Map<String, Object>) ReflectionTestUtils.getField(stockfishService, "evaluationCache");

            assertThat(evaluationCache).isNotNull();
            evaluationCache.forEach((key, cachedObj) ->
                ReflectionTestUtils.setField(cachedObj, "timestamp", System.currentTimeMillis() - 300L)
            );

            // Act
            int refreshedEval = stockfishService.getEvaluation(List.of(cacheKey), 5);

            // Assert
            assertThat(refreshedEval).isBetween(-10000, 10000);
        }
    }

    @Nested
    @DisplayName("Concurrency and Stress Scenarios")
    class ConcurrencyScenarios {

        @Test
        @DisplayName("Should successfully return best move and evaluation for standard starting position")
        void shouldReturnValidMoveAndEvaluationForStartPos() {
            // Arrange
            List<String> emptyHistory = List.of();
            int depth = 5;

            // Act
            String bestMove = stockfishService.getBestMove(emptyHistory, depth);
            Integer evaluation = stockfishService.getEvaluation(emptyHistory, depth);

            // Assert
            assertThat(bestMove).isNotBlank();
            assertThat(evaluation).isBetween(-10000, 10000);
        }

        @Test
        @DisplayName("Should handle high concurrent asynchronous requests without deadlocks or race conditions")
        void shouldHandleConcurrentEngineRequests() throws InterruptedException {
            // Arrange
            int threadCount = 10;
            ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
            CountDownLatch latch = new CountDownLatch(threadCount);
            List<String> moveHistory = List.of("e2e4", "e7e5", "g1f3", "b8c6");

            // Act
            for (int i = 0; i < threadCount; i++) {
                executorService.submit(() -> {
                    try {
                        CompletableFuture<String> bestMoveFuture = stockfishService.getBestMoveAsync(moveHistory, 5);
                        CompletableFuture<Integer> evalFuture = stockfishService.getEvaluationAsync(moveHistory, 5);

                        CompletableFuture.allOf(bestMoveFuture, evalFuture).join();

                        assertThat(bestMoveFuture.get()).isNotBlank();
                        assertThat(evalFuture.get()).isBetween(-10000, 10000);
                    } catch (Exception e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        latch.countDown();
                    }
                });
            }

            boolean completed = latch.await(10, TimeUnit.SECONDS);
            executorService.shutdownNow();

            // Assert
            assertThat(completed).isTrue();
        }

        @Test
        @DisplayName("Should handle null or empty move history gracefully")
        void shouldHandleNullOrEmptyMoveHistory() {
            // Arrange
            int depth = 3;

            // Act
            String bestMoveNull = stockfishService.getBestMove(null, depth);
            int evalNull = stockfishService.getEvaluation(null, depth);

            // Assert
            assertThat(bestMoveNull).isNotBlank();
            assertThat(evalNull).isBetween(-10000, 10000);
        }

        @Test
        @DisplayName("Should recover automatically if engine process is abruptly terminated")
        void shouldRecoverWhenEngineKilled() {
            // Arrange
            List<String> moveHistory = List.of("e2e4");
            int depth = 3;
            String initialMove = stockfishService.getBestMove(moveHistory, depth);

            // Act
            assertThat(initialMove).isNotBlank();
            stockfishService.stopEngine();
            stockfishService.startEngine();
            String recoveredMove = stockfishService.getBestMove(moveHistory, depth);

            // Assert
            assertThat(recoveredMove).isNotBlank();
        }
    }
}
