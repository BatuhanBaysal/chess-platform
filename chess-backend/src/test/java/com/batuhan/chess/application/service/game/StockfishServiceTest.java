package com.batuhan.chess.application.service.game;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@ExtendWith(MockitoExtension.class)
@DisplayName("Stockfish Service Comprehensive Tests")
class StockfishServiceTest {

    @InjectMocks
    private StockfishService stockfishService;

    @AfterEach
    void tearDown() {
        stockfishService.stopEngine();
    }

    @Nested
    @DisplayName("Engine Move Calculation Tests")
    class MoveCalculationTests {

        @Test
        @DisplayName("Should successfully return a valid best move given a move history")
        void shouldReturnBestMoveWithHistory() {
            // Act
            String bestMove = stockfishService.getBestMove(List.of("e2e4"), 5);

            // Assert
            assertThat(bestMove)
                .isNotBlank()
                .matches("^[a-h][1-8][a-h][1-8][qrbn]?$");
        }

        @Test
        @DisplayName("Should handle empty move history and return a valid opening move")
        void shouldHandleEmptyMoveHistory() {
            // Act
            String bestMove = stockfishService.getBestMove(List.of(), 5);

            // Assert
            assertThat(bestMove)
                .isNotBlank()
                .matches("^[a-h][1-8][a-h][1-8][qrbn]?$");
        }

        @Test
        @DisplayName("Should handle null move history gracefully without throwing exception")
        void shouldHandleNullMoveHistory() {
            // Act
            String bestMove = stockfishService.getBestMove(null, 5);

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
            stockfishService.startEngine();
            Process initialProcess = (Process) ReflectionTestUtils.getField(stockfishService, "process");
            assertThat(initialProcess).isNotNull();

            initialProcess.destroyForcibly();
            org.awaitility.Awaitility.await()
                .atMost(Duration.ofSeconds(3))
                .pollInterval(Duration.ofMillis(100))
                .until(() -> !initialProcess.isAlive());

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
            stockfishService.startEngine();

            // Act & Assert
            assertDoesNotThrow(() -> stockfishService.stopEngine());
            assertThat(ReflectionTestUtils.getField(stockfishService, "process")).isNull();
        }
    }

    @Nested
    @DisplayName("Engine Evaluation Tests")
    class EvaluationTests {

        @Test
        @DisplayName("Should return valid centipawn or mate evaluation score for given move history")
        void shouldReturnEvaluationScore() {
            // Act
            int evaluation = stockfishService.getEvaluation(List.of("e2e4"), 5);

            // Assert
            assertThat(evaluation).isBetween(-10000, 10000);
        }

        @Test
        @DisplayName("Should handle empty move history gracefully and return initial position evaluation")
        void shouldHandleEmptyHistoryForEvaluation() {
            // Act
            int evaluation = stockfishService.getEvaluation(List.of(), 5);

            // Assert
            assertThat(evaluation).isBetween(-10000, 10000);
        }

        @Test
        @DisplayName("Should handle null move history gracefully during evaluation")
        void shouldHandleNullHistoryForEvaluation() {
            // Act
            int evaluation = stockfishService.getEvaluation(null, 5);

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
            stockfishService.getEvaluation(List.of("e2e4"), 5);

            // Act & Assert
            @SuppressWarnings("unchecked")
            Map<String, Object> evaluationCache =
                (Map<String, Object>) ReflectionTestUtils.getField(stockfishService, "evaluationCache");

            assertThat(evaluationCache).containsKey("e2e4");
            int cachedEval = stockfishService.getEvaluation(List.of("e2e4"), 5);
            assertThat(cachedEval).isBetween(-10000, 10000);
        }

        @Test
        @DisplayName("Should respect throttle interval and refresh evaluation after cache expiration")
        void shouldRefreshEvaluationAfterThrottleInterval() {
            // Arrange
            String cacheKey = "e2e4";
            stockfishService.getEvaluation(List.of(cacheKey), 5);

            // Act
            @SuppressWarnings("unchecked")
            Map<String, Object> evaluationCache =
                (Map<String, Object>) ReflectionTestUtils.getField(stockfishService, "evaluationCache");

            assertThat(evaluationCache).isNotNull();
            evaluationCache.forEach((key, cachedObj) -> {
                ReflectionTestUtils.setField(cachedObj, "timestamp", System.currentTimeMillis() - 300L);
            });

            int refreshedEval = stockfishService.getEvaluation(List.of(cacheKey), 5);

            // Assert
            assertThat(refreshedEval).isBetween(-10000, 10000);
        }
    }
}
