package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameAnalysisMessage;
import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.domain.model.chess.Board;
import com.batuhan.chess.domain.model.chess.Color;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.chess.Position;
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
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@DisplayName("GameService Unit Tests")
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
    private GameEventProducer gameEventProducer;

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
        @DisplayName("Should create game session with unique 8-character ID")
        void shouldCreateGameSuccessfully() {
            // Arrange
            Long whitePlayerId = 1L;
            Long blackPlayerId = 2L;
            when(lobbyService.getRoom(anyString())).thenReturn(Optional.empty());

            // Act
            String gameId = gameService.createGame(whitePlayerId, blackPlayerId);

            // Assert
            assertThat(gameId).isNotNull().hasSize(8);
            verify(sessionManager).createNewGameWithPlayers(gameId, whitePlayerId, blackPlayerId, 10);
        }
    }

    @Nested
    @DisplayName("Player Readiness Operations")
    class PlayerReadyTests {

        @Test
        @DisplayName("Should start game clock when both human players are marked ready")
        void shouldStartClock_WhenBothPlayersReady() {
            // Arrange
            String gameId = "room123";
            Long whiteId = 1L;
            Long blackId = 2L;

            Game game = new Game(new Board());
            game.setWhitePlayerId(whiteId);
            game.setBlackPlayerId(blackId);

            Map<String, Set<Long>> readyMap = new ConcurrentHashMap<>();
            readyMap.put(gameId, ConcurrentHashMap.newKeySet());
            readyMap.get(gameId).add(whiteId);

            when(sessionManager.getReadyPlayers()).thenReturn(readyMap);
            when(sessionManager.getGame(gameId)).thenReturn(game);
            when(lobbyService.getRoom(gameId)).thenReturn(Optional.empty());

            // Act
            boolean ready = gameService.setPlayerReady(gameId, blackId);

            // Assert
            assertThat(ready).isTrue();
            assertThat(game.getLastMoveTimestamp()).isNotNull();
            verify(timerService).scheduleTimeoutTask(eq(gameId), anyLong());
            verify(broadcastManager).throttledBroadcast(gameId, game);
        }

        @Test
        @DisplayName("Should return false when gameId or userId is null")
        void shouldReturnFalse_WhenParametersNull() {
            // Act & Assert
            assertThat(gameService.setPlayerReady(null, 1L)).isFalse();
            assertThat(gameService.setPlayerReady("room123", null)).isFalse();
        }
    }

    @Nested
    @DisplayName("Response Conversion Operations")
    class ConversionTests {

        @Test
        @DisplayName("Should convert active game entity to GameResponse DTO")
        void shouldConvertGameToResponse() {
            // Arrange
            String gameId = "room123";
            Game game = new Game(new Board());
            game.setWhitePlayerId(1L);
            game.setBlackPlayerId(2L);
            game.getMoveHistory().add("e2e4");

            when(lobbyService.getRoom(gameId)).thenReturn(Optional.empty());
            when(sessionManager.isGameStarted(gameId)).thenReturn(true);

            // Act
            GameResponse response = gameService.convertToResponse(gameId, game);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.gameId()).isEqualTo(gameId);
            assertThat(response.currentTurn()).isEqualTo(Color.WHITE);
            assertThat(response.lastMoves()).hasSize(1);
            assertThat(response.isStarted()).isTrue();
        }
    }

    @Nested
    @DisplayName("Move Execution Operations")
    class MoveTests {

        @Test
        @DisplayName("Should delegate move execution to engine service")
        void shouldDelegateMoveToEngineService() {
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
            verify(engineService).makeMove(gameId, from, to, null);
        }
    }

    @Nested
    @DisplayName("AI Game Operations")
    class AiGameTests {

        @Test
        @DisplayName("Should create AI game without immediate engine move when human plays white")
        void shouldCreateAiGameAsWhite() {
            // Arrange
            Long humanUserId = 1L;

            // Act
            String gameId = gameService.createAiGame(humanUserId, true, 5, 10);

            // Assert
            assertThat(gameId).isNotNull().hasSize(8);
            verify(sessionManager).createNewGameWithPlayers(gameId, humanUserId, -1L, 10);
            verify(engineService, never()).triggerAiMoveIfNeededWithDifficulty(anyString(), any(), anyInt());
        }

        @Test
        @DisplayName("Should trigger AI move immediately when human plays black")
        void shouldTriggerAiMove_WhenHumanPlaysBlack() {
            // Arrange
            Long humanUserId = 1L;
            Game game = mock(Game.class);
            when(sessionManager.getGame(anyString())).thenReturn(game);

            // Act
            String gameId = gameService.createAiGame(humanUserId, false, 8, 15);

            // Assert
            assertThat(gameId).isNotNull().hasSize(8);
            verify(sessionManager).createNewGameWithPlayers(gameId, -1L, humanUserId, 15);
            verify(engineService).triggerAiMoveIfNeededWithDifficulty(gameId, game, 8);
        }
    }

    @Nested
    @DisplayName("Game Finish Operations")
    class FinishValidationTests {

        @Test
        @DisplayName("Should finish active game and queue analysis event")
        void shouldFinishActiveGameAndQueueAnalysis() {
            // Arrange
            String gameId = "room123";
            Game game = mock(Game.class);
            GameStatus status = mock(GameStatus.class);
            GameResult result = GameResult.WHITE_WIN;

            when(sessionManager.getGame(gameId)).thenReturn(game);
            when(game.getStatus()).thenReturn(status);
            when(status.isFinished()).thenReturn(false);
            when(timerService.determineResult(game, status)).thenReturn(result);
            when(game.getMoveHistory()).thenReturn(List.of("e4", "e5"));
            when(game.getWhitePlayerId()).thenReturn(1L);
            when(game.getBlackPlayerId()).thenReturn(2L);

            // Act
            boolean finished = gameService.finishGameIfActive(gameId);

            // Assert
            assertThat(finished).isTrue();
            verify(persistenceService).processGameFinish(gameId, result, status);
            verify(gameEventProducer).sendGameForAnalysis(any(GameAnalysisMessage.class));
        }

        @Test
        @DisplayName("Should ignore finish request when game is already finished")
        void shouldIgnoreFinish_WhenGameAlreadyFinished() {
            // Arrange
            String gameId = "room123";
            Game game = mock(Game.class);
            GameStatus status = mock(GameStatus.class);

            when(sessionManager.getGame(gameId)).thenReturn(game);
            when(game.getStatus()).thenReturn(status);
            when(status.isFinished()).thenReturn(true);

            // Act
            boolean finished = gameService.finishGameIfActive(gameId);

            // Assert
            assertThat(finished).isTrue();
            verify(persistenceService, never()).processGameFinish(anyString(), any(), any());
        }
    }
}
