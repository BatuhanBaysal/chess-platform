package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.controller.GameWebSocketController;
import com.batuhan.chess.domain.model.chess.Board;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.GameRepository;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class GamePersistenceServiceTest {

    @Mock
    private GameRepository gameRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EloService eloService;

    @Mock
    private GameSessionManager sessionManager;

    @Mock
    private GameTimerService timerService;

    @Mock
    private GameWebSocketController webSocketController;

    @Mock
    private GameService self;

    @Mock
    private GamePersistenceService persistenceSelf;

    @InjectMocks
    private GamePersistenceService persistenceService;

    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    @Test
    void shouldProcessGameFinishSuccessfully() {
        // Arrange
        String gameId = "room123";
        Game game = new Game(new Board());
        game.setStatus(GameStatus.ACTIVE);

        when(sessionManager.getGame(gameId)).thenReturn(game);

        // Act
        persistenceService.processGameFinish(gameId, GameResult.WHITE_WIN, GameStatus.CHECKMATE);

        // Assert
        assertThat(game.getStatus()).isEqualTo(GameStatus.CLOSING);
        verify(timerService, times(1)).cancelTimeoutTask(gameId);
        verify(self, times(1)).handleFinishLogic(gameId, game, GameResult.WHITE_WIN, GameStatus.CHECKMATE);
    }

    @Test
    void shouldHandleFinishLogicSuccessfully() {
        // Arrange
        String gameId = "room123";
        Game game = new Game(new Board());
        game.setWhitePlayerId(1L);
        game.setBlackPlayerId(2L);

        UserEntity whiteUser = new UserEntity();
        whiteUser.setEloRating(1200);
        whiteUser.setTotalWins(0);
        whiteUser.setTotalLosses(0);

        UserEntity blackUser = new UserEntity();
        blackUser.setEloRating(1200);
        blackUser.setTotalWins(0);
        blackUser.setTotalLosses(0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(whiteUser));
        when(userRepository.findById(2L)).thenReturn(Optional.of(blackUser));
        when(eloService.calculateGain(anyInt(), anyInt(), anyDouble())).thenReturn(15);
        when(gameRepository.saveAndFlush(any(GameEntity.class))).thenReturn(new GameEntity());

        // Act
        persistenceService.handleFinishLogic(gameId, game, GameResult.WHITE_WIN, GameStatus.CHECKMATE);

        // Assert
        assertThat(game.getStatus()).isEqualTo(GameStatus.CHECKMATE);
        verify(gameRepository, times(1)).saveAndFlush(any(GameEntity.class));
        verify(webSocketController, times(1)).broadcastGameUpdate(gameId, game);
        verify(webSocketController, times(1)).sendGameOver(gameId, GameResult.WHITE_WIN);
    }

    @Test
    void shouldProcessPlayerDismissForWhitePlayer() {
        // Arrange
        String gameId = "room123";
        Long userId = 1L;
        Game game = new Game(new Board());
        game.setWhitePlayerId(1L);
        game.setBlackPlayerId(2L);
        game.setStatus(GameStatus.ACTIVE);

        when(sessionManager.getGame(gameId)).thenReturn(game);

        // Act
        persistenceService.processPlayerDismiss(gameId, userId);

        // Assert
        verify(persistenceSelf, times(1)).processGameFinish(gameId, GameResult.BLACK_WIN, GameStatus.ABANDONED);
        verify(persistenceSelf, times(1)).cleanupSession(gameId);
    }

    @Test
    void shouldCleanupSessionSuccessfully() {
        // Arrange
        String gameId = "room123";

        // Act
        persistenceService.cleanupSession(gameId);

        // Assert
        verify(timerService, times(1)).cancelTimeoutTask(gameId);
        verify(sessionManager, times(1)).removeGame(gameId);
    }

    @Test
    void shouldGetGameHistorySuccessfully() {
        // Arrange
        Long userId = 1L;
        List<GameEntity> expectedHistory = Collections.singletonList(new GameEntity());

        when(gameRepository.findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc(userId, userId)).thenReturn(expectedHistory);

        // Act
        List<GameEntity> history = persistenceService.getGameHistory(userId);

        // Assert
        assertThat(history).hasSize(1);
        verify(gameRepository, times(1)).findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc(userId, userId);
    }
}
