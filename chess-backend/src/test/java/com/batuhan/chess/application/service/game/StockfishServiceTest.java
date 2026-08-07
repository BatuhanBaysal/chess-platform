package com.batuhan.chess.application.service.game;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

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
}
