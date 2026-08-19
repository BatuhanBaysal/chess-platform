package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.HintResponse;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.chess.Position;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@DisplayName("Game Service Unit Tests")
class GameServiceTest {

    @Mock
    private GameSessionManager sessionManager;

    @Mock
    private GameEngineService engineService;

    @Mock
    private GamePersistenceService persistenceService;

    @Mock
    private LobbyService lobbyService;

    @Mock
    private GameBroadcastManager broadcastManager;

    @Mock
    private GameTimerService timerService;

    @Mock
    private StockfishService stockfishService;

    @InjectMocks
    private GameService gameService;

    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    @Nested
    @DisplayName("Game Creation Operations")
    class CreationTests {

        @Test
        @DisplayName("Should create a new game session with a unique ID and proper player mapping")
        void shouldCreateGame() {
            // Arrange
            Long whitePlayerId = 1L;
            Long blackPlayerId = 2L;
            when(lobbyService.getRoom(anyString())).thenReturn(null);

            // Act
            String gameId = gameService.createGame(whitePlayerId, blackPlayerId);

            // Assert
            assertThat(gameId)
                .isNotNull()
                .hasSize(8);
            verify(sessionManager, times(1)).createNewGameWithPlayers(gameId, whitePlayerId, blackPlayerId, 10);
        }
    }

    @Nested
    @DisplayName("Move Execution Operations")
    class MoveTests {

        @Test
        @DisplayName("Should delegate move execution to engine service successfully")
        void shouldMakeMove() {
            // Arrange
            String gameId = "room123";
            Position from = new Position(4, 1);
            Position to = new Position(4, 3);
            List<GameResponse.ExecutedMove> expectedMoves = Collections.emptyList();
            when(engineService.makeMove(gameId, from, to, null)).thenReturn(expectedMoves);

            // Act
            List<GameResponse.ExecutedMove> result = gameService.makeMove(gameId, from, to, null);

            // Assert
            assertThat(result).isEqualTo(expectedMoves);
            verify(engineService, times(1)).makeMove(gameId, from, to, null);
        }
    }

    @Nested
    @DisplayName("Engine Hint Operations")
    class HintTests {

        @Test
        @DisplayName("Should fetch engine hint successfully from engine service")
        void shouldGetEngineHint() {
            // Arrange
            String gameId = "room123";
            int depth = 10;
            HintResponse expectedHint = new HintResponse("e2e4", 30, "Best move");
            when(engineService.getEngineHint(gameId, depth)).thenReturn(expectedHint);

            // Act
            HintResponse hint = gameService.getEngineHint(gameId, depth);

            // Assert
            assertThat(hint)
                .isNotNull();
            assertThat(hint.bestMoveUci()).isEqualTo("e2e4");
            verify(engineService, times(1)).getEngineHint(gameId, depth);
        }
    }

    @Nested
    @DisplayName("Persistence & History Operations")
    class PersistenceTests {

        @Test
        @DisplayName("Should fetch game history for a specific user successfully")
        void shouldGetGameHistory() {
            // Arrange
            Long userId = 1L;
            List<GameEntity> expectedHistory = Collections.singletonList(new GameEntity());
            when(persistenceService.getGameHistory(userId)).thenReturn(expectedHistory);

            // Act
            List<GameEntity> history = gameService.getGameHistory(userId);

            // Assert
            assertThat(history).hasSize(1);
            verify(persistenceService, times(1)).getGameHistory(userId);
        }

        @Test
        @DisplayName("Should process game finish and delegate to persistence service")
        void shouldProcessGameFinish() {
            // Arrange
            String gameId = "room123";
            GameResult result = GameResult.WHITE_WIN;
            GameStatus status = GameStatus.CHECKMATE;

            // Act
            gameService.processGameFinish(gameId, result, status);

            // Assert
            verify(persistenceService, times(1)).processGameFinish(gameId, result, status);
        }
    }
}
