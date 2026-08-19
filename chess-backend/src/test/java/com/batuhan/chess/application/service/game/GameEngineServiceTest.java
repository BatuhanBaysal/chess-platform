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
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@DisplayName("Game Engine Service Unit Tests")
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

    @Test
    @DisplayName("Should fetch engine hint successfully when game exists")
    void shouldGetEngineHintSuccessfully()  {
        // Arrange
        String gameId = "room123";
        Game game = mock(Game.class);
        when(game.getMoveHistory()).thenReturn(Collections.emptyList());
        when(sessionManager.getGame(gameId)).thenReturn(game);
        when(stockfishService.getBestMove(any(), anyInt())).thenReturn("e2e4");
        when(stockfishService.getEvaluation(any(), anyInt())).thenReturn(30);

        // Act
        HintResponse response = engineService.getEngineHint(gameId, 10);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.bestMoveUci()).isEqualTo("e2e4");
        assertThat(response.evaluationScore()).isEqualTo(30);
    }

    @Test
    @DisplayName("Should throw exception when getting hint for non-existent game")
    void shouldThrowExceptionWhenGetHintGameNotFound() {
        // Arrange
        String gameId = "room123";
        when(sessionManager.getGame(gameId)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> engineService.getEngineHint(gameId, 10))
            .isInstanceOf(GameOperationException.class)
            .hasMessage("Game not found");
    }

    @Test
    @DisplayName("Should execute move successfully under lock")
    void shouldMakeMoveSuccessfully() {
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
        assertThat(moves)
            .isNotNull()
            .hasSize(1);
        verify(rLock).unlock();
    }

    @Test
    @DisplayName("Should throw exception when lock cannot be acquired")
    void shouldThrowExceptionWhenLockError() {
        // Arrange
        String gameId = "room123";
        Position from = new Position(4, 1);
        Position to = new Position(4, 3);
        when(redissonClient.getLock(anyString())).thenReturn(rLock);

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
