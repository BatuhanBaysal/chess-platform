package com.batuhan.chess.application.service.game;

import com.batuhan.chess.domain.model.chess.Board;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameResult;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DisplayName("GameTimerService Unit Tests")
class GameTimerServiceTest {

    @Mock
    private GameSessionManager sessionManager;

    @InjectMocks
    private GameTimerService timerService;

    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
    }

    @AfterEach
    void tearDown() throws Exception {
        timerService.shutdownScheduler();
        closeable.close();
    }

    @Nested
    @DisplayName("Expiration Checks")
    class ExpirationTests {

        @Test
        @DisplayName("Should detect time expiration when remaining milliseconds drop below zero")
        void shouldDetectTimeExpired_WhenRemainingMsIsNegative() {
            // Arrange
            Game game = new Game(new Board());
            game.setRemainingTimes(-100L, 60000L);

            // Act
            boolean isExpired = timerService.isTimeExpired(game);

            // Assert
            assertThat(isExpired).isTrue();
        }
    }

    @Nested
    @DisplayName("Result Determinations")
    class ResultDeterminationTests {

        @Test
        @DisplayName("Should award win to opponent when timeout occurs")
        void shouldDetermineTimeoutResult_ForCurrentPlayer() {
            // Arrange
            Game game = new Game(new Board());

            // Act
            GameResult whiteTimeoutResult = timerService.determineResult(game, GameStatus.TIMEOUT);

            // Assert
            assertThat(whiteTimeoutResult).isEqualTo(GameResult.BLACK_WIN);
        }

        @Test
        @DisplayName("Should return DRAW when status is STALEMATE or DRAW")
        void shouldReturnDraw_WhenStatusIsStalemateOrDraw() {
            // Arrange
            Game game = new Game(new Board());

            // Act
            GameResult stalemateResult = timerService.determineResult(game, GameStatus.STALEMATE);
            GameResult drawResult = timerService.determineResult(game, GameStatus.DRAW);

            // Assert
            assertThat(stalemateResult).isEqualTo(GameResult.DRAW);
            assertThat(drawResult).isEqualTo(GameResult.DRAW);
        }
    }

    @Nested
    @DisplayName("Task Scheduling Operations")
    class SchedulingTests {

        @Test
        @DisplayName("Should schedule timeout task and allow safe cancellation")
        void shouldScheduleAndCancelTimeoutTask() {
            // Arrange
            String gameId = "room123";
            Game game = new Game(new Board());
            ConcurrentHashMap<String, Game> activeGames = new ConcurrentHashMap<>();
            activeGames.put(gameId, game);
            when(sessionManager.getActiveGames()).thenReturn(activeGames);

            // Act
            timerService.scheduleTimeoutTask(gameId, 5000L);

            // Assert
            assertThat(activeGames).containsKey(gameId);
            timerService.cancelTimeoutTask(gameId);
        }
    }
}
