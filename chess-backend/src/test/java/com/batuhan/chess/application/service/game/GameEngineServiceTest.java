package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.HintResponse;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.domain.model.chess.*;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@DisplayName("GameEngineService Unit Tests")
class GameEngineServiceTest {

    @Mock
    private GameSessionManager sessionManager;

    @Mock
    private GameTimerService timerService;

    @Mock
    private GameBroadcastManager broadcastManager;

    @Mock
    private StockfishService stockfishService;

    @Mock
    private RedissonClient redissonClient;

    @Spy
    private MeterRegistry meterRegistry = new SimpleMeterRegistry();

    @Mock
    private GameService self;

    @Mock
    private RLock rLock;

    private GameEngineService engineService;
    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
        lenient().when(redissonClient.getLock(anyString())).thenReturn(rLock);

        try {
            lenient().when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        engineService = new GameEngineService(
            sessionManager,
            timerService,
            stockfishService,
            redissonClient,
            broadcastManager,
            meterRegistry,
            self
        );
    }

    @AfterEach
    void tearDown() throws Exception {
        if (closeable != null) {
            closeable.close();
        }
    }

    @Nested
    @DisplayName("Engine Hint Operations")
    class HintOperationsTests {

        @Test
        @DisplayName("Should fetch engine hint successfully when game exists")
        void shouldGetEngineHintSuccessfully_WhenGameExists() {
            // Arrange
            String gameId = "room123";
            Game game = mock(Game.class);
            when(game.getMoveHistory()).thenReturn(Collections.emptyList());
            when(sessionManager.getGame(gameId)).thenReturn(game);
            when(stockfishService.getBestMoveAsync(any(), anyInt())).thenReturn(CompletableFuture.completedFuture("e2e4"));
            when(stockfishService.getEvaluationAsync(any(), anyInt())).thenReturn(CompletableFuture.completedFuture(30));

            // Act
            HintResponse response = engineService.getEngineHint(gameId, 10);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.bestMoveUci()).isEqualTo("e2e4");
            assertThat(response.evaluationScore()).isEqualTo(30);
        }

        @Test
        @DisplayName("Should throw GameOperationException when hint requested for non-existent game")
        void shouldThrowException_WhenHintGameNotFound() {
            // Arrange
            String gameId = "room123";
            when(sessionManager.getGame(gameId)).thenReturn(null);

            // Act & Assert
            assertThatThrownBy(() -> engineService.getEngineHint(gameId, 10))
                .isInstanceOf(GameOperationException.class)
                .hasMessage("Game not found");
        }
    }

    @Nested
    @DisplayName("Move Execution Operations")
    class MoveExecutionTests {

        @Test
        @DisplayName("Should execute move successfully under lock")
        void shouldMakeMoveSuccessfully_UnderLock() {
            // Arrange
            String gameId = "room123";
            Position from = new Position(4, 1);
            Position to = new Position(4, 3);
            Game game = mock(Game.class);
            GameStateEvaluator evaluator = mock(GameStateEvaluator.class);

            when(sessionManager.getGame(gameId)).thenReturn(game);
            when(game.getStatus()).thenReturn(GameStatus.ACTIVE);
            when(timerService.isTimeExpired(game)).thenReturn(false);
            when(game.makeMove(from, to, null)).thenReturn(List.of(new Game.ExecutedMoveData(4, 1, 4, 3, "PAWN")));
            when(game.getCurrentTurn()).thenReturn(Color.WHITE);
            when(game.getWhiteRemainingTimeMs()).thenReturn(60000L);

            when(game.getEvaluator()).thenReturn(evaluator);
            when(evaluator.evaluateStatus(any(), any(), any(), anyInt(), any(), any())).thenReturn(GameStatus.ACTIVE);

            // Act
            List<GameResponse.ExecutedMove> moves = engineService.makeMove(gameId, from, to, null);

            // Assert
            assertThat(moves).hasSize(1);
            verify(rLock).unlock();
        }

        @Test
        @DisplayName("Should throw GameOperationException when game is already finished")
        void shouldThrowException_WhenGameIsFinished() {
            // Arrange
            String gameId = "room123";
            Position from = new Position(4, 1);
            Position to = new Position(4, 3);
            Game game = mock(Game.class);
            when(sessionManager.getGame(gameId)).thenReturn(game);
            when(game.getStatus()).thenReturn(GameStatus.CHECKMATE);

            // Act & Assert
            assertThatThrownBy(() -> engineService.makeMove(gameId, from, to, null))
                .isInstanceOf(GameOperationException.class)
                .hasMessage("Cannot make a move in a finished game");
        }

        @Test
        @DisplayName("Should throw GameOperationException when remaining time has expired")
        void shouldThrowException_WhenTimeExpired() {
            // Arrange
            String gameId = "room123";
            Position from = new Position(4, 1);
            Position to = new Position(4, 3);
            Game game = mock(Game.class);
            when(sessionManager.getGame(gameId)).thenReturn(game);
            when(game.getStatus()).thenReturn(GameStatus.ACTIVE);
            when(timerService.isTimeExpired(game)).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> engineService.makeMove(gameId, from, to, null))
                .isInstanceOf(GameOperationException.class)
                .hasMessage("Time expired");

            verify(self).processGameFinish(eq(gameId), any(), eq(GameStatus.TIMEOUT));
        }

        @Test
        @DisplayName("Should throw GameOperationException when lock acquisition fails")
        void shouldThrowException_WhenLockCannotBeAcquired() {
            // Arrange
            String gameId = "room123";
            Position from = new Position(4, 1);
            Position to = new Position(4, 3);

            try {
                when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(false);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // Act & Assert
            assertThatThrownBy(() -> engineService.makeMove(gameId, from, to, null))
                .isInstanceOf(GameOperationException.class)
                .hasMessage("Lock error");
        }
    }
}
