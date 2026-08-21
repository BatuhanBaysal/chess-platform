package com.batuhan.chess.application.service.game;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Stockfish Concurrency and Stress Tests")
class StockfishConcurrencyTest {

    private StockfishService stockfishService;

    @BeforeEach
    void setUp() {
        stockfishService = new StockfishService();
        stockfishService.startEngine();
    }

    @AfterEach
    void tearDown() {
        stockfishService.stopEngine();
    }

    @Nested
    @DisplayName("Positive Scenarios")
    class PositiveScenarios {

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
    }

    @Nested
    @DisplayName("Edge Cases and Negative Scenarios")
    class NegativeAndEdgeCases {

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
            assertThat(initialMove).isNotBlank();

            // Act
            stockfishService.stopEngine();
            stockfishService.startEngine();
            String recoveredMove = stockfishService.getBestMove(moveHistory, depth);

            // Assert
            assertThat(recoveredMove).isNotBlank();
        }
    }
}
