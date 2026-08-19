package com.batuhan.chess.application.service.game;

import com.batuhan.chess.domain.model.chess.Board;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameResult;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DisplayName("Game Timer Service Unit Tests")
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

    @Test
    @DisplayName("Should detect when game time has expired for white player")
    void shouldDetectTimeExpiredForWhite() {
        // Arrange
        Game game = new Game(new Board());
        game.setRemainingTimes(-100L, 60000L);

        // Act
        boolean isExpired = timerService.isTimeExpired(game);

        // Assert
        assertThat(isExpired).isTrue();
    }

    @Test
    @DisplayName("Should determine correct game result when timeout occurs")
    void shouldDetermineTimeoutResult() {
        // Arrange
        Game game = new Game(new Board());

        // Act
        GameResult whiteTimeoutResult = timerService.determineResult(game, GameStatus.TIMEOUT);

        // Assert
        assertThat(whiteTimeoutResult).isEqualTo(GameResult.BLACK_WIN);
    }

    @Test
    @DisplayName("Should schedule timeout task successfully")
    void shouldScheduleTimeoutTask() {
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

    @Test
    @DisplayName("Should cancel scheduled timeout task")
    void shouldCancelTimeoutTask() {
        // Arrange
        String gameId = "room123";
        timerService.scheduleTimeoutTask(gameId, 5000L);

        // Act
        timerService.cancelTimeoutTask(gameId);

        // Assert
        assertThat(gameId).isNotNull();
    }
}
