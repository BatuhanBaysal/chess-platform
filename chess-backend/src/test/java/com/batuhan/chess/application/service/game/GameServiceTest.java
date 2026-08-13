package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.controller.GameWebSocketController;
import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.chess.Position;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.GameRepository;
import com.batuhan.chess.domain.repository.UserRepository;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Game Service Core Business Logic Tests")
class GameServiceTest {

    @Mock private GameRepository gameRepository;
    @Mock private UserRepository userRepository;
    @Mock private EloService eloService;
    @Mock private LobbyService lobbyService;
    @Mock private RedissonClient redissonClient;
    @Mock private RLock rLock;
    @Mock private GameWebSocketController webSocketController;
    @Mock private StockfishService stockfishService;

    @Spy
    private MeterRegistry meterRegistry = new SimpleMeterRegistry();

    @InjectMocks
    private GameService gameService;

    private final Long whiteId = 1L;
    private final Long blackId = 2L;
    private String gameId;

    @BeforeEach
    void setUp() throws InterruptedException {
        lenient().when(redissonClient.getLock(anyString())).thenReturn(rLock);
        lenient().when(rLock.tryLock(anyLong(), anyLong(), any())).thenReturn(true);

        LobbyService.GameRoom mockRoom = mock(LobbyService.GameRoom.class);
        when(mockRoom.getTimeLimit()).thenReturn(300);
        lenient().when(lobbyService.getRoom(anyString())).thenReturn(mockRoom);

        GameService realService = new GameService(
            gameRepository, userRepository, eloService,
            meterRegistry, redissonClient, lobbyService,
            webSocketController, stockfishService, null
        );
        gameService = spy(realService);

        ReflectionTestUtils.setField(gameService, "self", gameService);
        ReflectionTestUtils.setField(realService, "self", gameService);

        gameService.initMetrics();
        gameId = gameService.createGame(whiteId, blackId);

        Game game = gameService.getGame(gameId);
        if (game != null) {
            game.setWhiteRemainingTimeMs(300000L);
            game.setBlackRemainingTimeMs(300000L);
        }
    }

    @Nested
    @DisplayName("Game Session Management")
    class SessionTests {

        @Test
        @DisplayName("Should initialize a new game session with unique ID and assigned players")
        void shouldInitializeGameSession() {
            // Arrange
            Long p1 = 10L;
            Long p2 = 20L;

            // Act
            String newGameId = gameService.createGame(p1, p2);

            // Assert
            assertThat(newGameId).isNotBlank();
            assertThat(gameService.getGame(newGameId)).satisfies(game -> {
                assertThat(game.getWhitePlayerId()).isEqualTo(p1);
                assertThat(game.getBlackPlayerId()).isEqualTo(p2);
            });
        }

        @Test
        @DisplayName("Should correctly track player readiness flow before starting the game")
        void shouldManagePlayerReadinessFlow() {
            // Act
            boolean whiteReady = gameService.setPlayerReady(gameId, whiteId);
            boolean blackReady = gameService.setPlayerReady(gameId, blackId);

            // Assert
            assertThat(whiteReady).isFalse();
            assertThat(blackReady).isTrue();
            assertThat(gameService.isGameStarted(gameId)).isTrue();
        }
    }

    @Nested
    @DisplayName("Move Execution & Validation")
    class MoveTests {

        @Test
        @DisplayName("Should execute a legal move and increment move metrics")
        void shouldExecuteLegalMoveSuccessfully() {
            // Arrange
            gameService.setPlayerReady(gameId, whiteId);
            gameService.setPlayerReady(gameId, blackId);
            Position from = new Position(4, 1);
            Position to = new Position(4, 3);

            // Act
            List<GameResponse.ExecutedMove> moves = gameService.makeMove(gameId, from, to, null);

            // Assert
            assertThat(moves).isNotEmpty();
            assertThat(meterRegistry.counter("chess.moves.total").count()).isEqualTo(1.0);
        }

        @Test
        @DisplayName("Should throw GameOperationException when moving in a finished game")
        void shouldPreventMoveInFinishedGame() {
            // Arrange
            gameService.setPlayerReady(gameId, whiteId);
            gameService.setPlayerReady(gameId, blackId);
            gameService.getGame(gameId).setStatus(GameStatus.CHECKMATE);
            Position pos = new Position(4, 1);

            // Act & Assert
            assertThatThrownBy(() -> gameService.makeMove(gameId, pos, pos, null))
                .isInstanceOf(GameOperationException.class)
                .hasMessageContaining("finished");
        }
    }

    @Nested
    @DisplayName("Post-Game Processing & Elo Updates")
    class PostGameTests {

        @Test
        @DisplayName("Should update user statistics and persist game history on finish")
        void shouldProcessGameFinishCorrectly() {
            // Arrange
            UserEntity white = UserEntity.builder().id(whiteId).eloRating(1200).build();
            UserEntity black = UserEntity.builder().id(blackId).eloRating(1200).build();
            when(userRepository.findById(whiteId)).thenReturn(Optional.of(white));
            when(userRepository.findById(blackId)).thenReturn(Optional.of(black));
            when(eloService.calculateGain(anyInt(), anyInt(), anyDouble())).thenReturn(25);

            // Act
            gameService.processGameFinish(gameId, GameResult.WHITE_WIN, GameStatus.CHECKMATE);

            // Assert
            assertThat(white.getEloRating()).isEqualTo(1225);
            verify(gameRepository).saveAndFlush(any(GameEntity.class));
        }

        @Test
        @DisplayName("Should exit gracefully if the game is already in CLOSING status")
        void shouldIgnoreClosingGames() {
            // Arrange
            gameService.getGame(gameId).setStatus(GameStatus.CLOSING);

            // Act
            gameService.processGameFinish(gameId, GameResult.WHITE_WIN, GameStatus.CHECKMATE);

            // Assert
            verifyNoInteractions(gameRepository);
            verifyNoInteractions(userRepository);
        }
    }

    @Nested
    @DisplayName("Watchdog & Heartbeat Mechanism")
    class WatchdogTests {

        @Test
        @DisplayName("Should record player heartbeat successfully")
        void shouldRecordPlayerHeartbeat() {
            // Act
            gameService.recordHeartbeat(gameId, whiteId);

            // Assert
            @SuppressWarnings("unchecked")
            ConcurrentHashMap<String, ConcurrentHashMap<Long, Long>> heartbeats =
                (ConcurrentHashMap<String, ConcurrentHashMap<Long, Long>>) ReflectionTestUtils.getField(gameService, "playerHeartbeats");

            assertThat(heartbeats).satisfies(h -> {
                assertThat(h).containsKey(gameId);
                assertThat(h.get(gameId)).containsKey(whiteId);
            });
        }

        @Test
        @DisplayName("Should timeout player and abandon game when heartbeat is missing")
        void shouldTimeoutPlayerWhenHeartbeatExpired() {
            // Arrange
            ReflectionTestUtils.setField(gameService, "self", gameService);

            gameService.setPlayerReady(gameId, whiteId);
            gameService.setPlayerReady(gameId, blackId);

            long pastTime = System.currentTimeMillis() - 35_000L;
            ConcurrentHashMap<Long, Long> timestamps = new ConcurrentHashMap<>();
            timestamps.put(whiteId, pastTime);

            @SuppressWarnings("unchecked")
            ConcurrentHashMap<String, ConcurrentHashMap<Long, Long>> heartbeats =
                (ConcurrentHashMap<String, ConcurrentHashMap<Long, Long>>) ReflectionTestUtils.getField(gameService, "playerHeartbeats");

            if (heartbeats != null) {
                heartbeats.put(gameId, timestamps);
            }

            // Act
            Runnable task = (Runnable) ReflectionTestUtils.getField(gameService, "watchdogTask");
            assertThat(task).isNotNull();
            task.run();

            // Assert
            Game game = gameService.getGame(gameId);
            assertThat(game).isNotNull();
            assertThat(game.getStatus()).isEqualTo(GameStatus.ABANDONED);
            verify(gameService).processGameFinish(gameId, GameResult.BLACK_WIN, GameStatus.ABANDONED);
        }
    }

    @Nested
    @DisplayName("Dismiss & Abandonment Mechanism")
    class DismissTests {

        @Test
        @DisplayName("Should mark game as abandoned and clean up session when player dismisses")
        void shouldProcessPlayerDismissSuccessfully() {
            // Arrange
            ReflectionTestUtils.setField(gameService, "self", gameService);
            gameService.setPlayerReady(gameId, whiteId);
            gameService.setPlayerReady(gameId, blackId);

            // Act
            gameService.processPlayerDismiss(gameId, whiteId);

            // Assert
            Game game = gameService.getGame(gameId);
            assertThat(game).isNull();
            verify(gameService).processGameFinish(gameId, GameResult.BLACK_WIN, GameStatus.ABANDONED);
        }

        @Test
        @DisplayName("Should ignore dismiss if user is not part of the game")
        void shouldIgnoreDismissForInvalidUser() {
            // Arrange
            ReflectionTestUtils.setField(gameService, "self", gameService);
            Long invalidUserId = 99L;

            // Act
            gameService.processPlayerDismiss(gameId, invalidUserId);

            // Assert
            verify(gameService, never()).processGameFinish(anyString(), any(), any());
        }
    }

    @Nested
    @DisplayName("AI Game Integration Tests")
    class AiGameTests {

        @Test
        @DisplayName("Should initialize AI game correctly when human plays as white")
        void shouldCreateAiGameAsWhite() {
            // Act
            String aiGameId = gameService.createAiGame(whiteId, true, 3, 10);

            // Assert
            assertThat(aiGameId).isNotBlank();
            assertThat(gameService.getGame(aiGameId)).satisfies(game -> {
                assertThat(game.getWhitePlayerId()).isEqualTo(whiteId);
                assertThat(game.getBlackPlayerId()).isEqualTo(-1L);
            });
        }

        @Test
        @DisplayName("Should initialize AI game and trigger immediate AI move when human plays as black")
        void shouldCreateAiGameAsBlackAndTriggerAiMove() {
            // Arrange
            when(stockfishService.getBestMove(anyList(), anyInt())).thenReturn("e2e4");

            // Act
            String aiGameId = gameService.createAiGame(whiteId, false, 3, 10);

            // Assert
            assertThat(aiGameId).isNotBlank();
            assertThat(gameService.getGame(aiGameId)).satisfies(game -> {
                assertThat(game.getWhitePlayerId()).isEqualTo(-1L);
                assertThat(game.getBlackPlayerId()).isEqualTo(whiteId);
            });

            verify(stockfishService, atLeastOnce()).getBestMove(anyList(), eq(3));
        }

        @Test
        @DisplayName("Should trigger AI move automatically after human makes a move against AI")
        void shouldTriggerAiMoveAfterHumanMove() throws Exception {
            // Arrange
            String aiGameId = gameService.createAiGame(whiteId, true, 3, 10);
            gameService.setPlayerReady(aiGameId, whiteId);
            gameService.setPlayerReady(aiGameId, -1L);

            when(stockfishService.getBestMove(anyList(), anyInt())).thenReturn("e7e5");

            Position from = new Position(4, 1);
            Position to = new Position(4, 3);

            // Act
            List<GameResponse.ExecutedMove> moves = gameService.makeMove(aiGameId, from, to, null);
            Thread.sleep(5500);

            // Assert
            assertThat(moves).isNotEmpty();
            verify(stockfishService, atLeastOnce()).getBestMove(anyList(), eq(10));
        }
    }

    @Nested
    @DisplayName("Engine Hint & Analysis Integration Tests")
    class EngineHintTests {

        @Test
        @DisplayName("Should return engine hint successfully for active game")
        void shouldReturnEngineHintSuccessfully() {
            // Arrange
            when(stockfishService.getBestMove(anyList(), anyInt())).thenReturn("e2e4");
            when(stockfishService.getEvaluation(anyList(), anyInt())).thenReturn(35);

            // Act
            var hint = gameService.getEngineHint(gameId, 10);

            // Assert
            assertThat(hint).isNotNull();
            assertThat(hint.bestMoveUci()).isEqualTo("e2e4");
            assertThat(hint.evaluationScore()).isEqualTo(35);
            verify(stockfishService).getBestMove(anyList(), eq(10));
            verify(stockfishService).getEvaluation(anyList(), eq(10));
        }

        @Test
        @DisplayName("Should throw GameOperationException when requesting hint for non-existent game")
        void shouldThrowExceptionWhenGameNotFoundForHint() {
            // Arrange
            String nonExistentGameId = "invalid-game-id";

            // Act & Assert
            assertThatThrownBy(() -> gameService.getEngineHint(nonExistentGameId, 10))
                .isInstanceOf(GameOperationException.class)
                .hasMessageContaining("Game not found");
        }
    }
}
