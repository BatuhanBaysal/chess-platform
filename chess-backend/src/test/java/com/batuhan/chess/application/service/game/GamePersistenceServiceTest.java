package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.controller.GameWebSocketController;
import com.batuhan.chess.api.dto.game.GameAnalysisMessage;
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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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

@DisplayName("Game Persistence Service Unit Tests")
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
    private GameEventProducer gameEventProducer;

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

    @Nested
    @DisplayName("Game Finish Operations")
    class FinishOperationsTests {

        @Test
        @DisplayName("Should process game finish successfully when game is active")
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
        @DisplayName("Should not process finish when game is already closing")
        void shouldNotProcessFinishWhenGameAlreadyClosing() {
            // Arrange
            String gameId = "room123";
            Game game = new Game(new Board());
            game.setStatus(GameStatus.CLOSING);

            when(sessionManager.getGame(gameId)).thenReturn(game);

            // Act
            persistenceService.processGameFinish(gameId, GameResult.WHITE_WIN, GameStatus.CHECKMATE);

            // Assert
            verify(timerService, never()).cancelTimeoutTask(anyString());
            verify(self, never()).handleFinishLogic(anyString(), any(), any(), any());
        }

        @Test
        @DisplayName("Should handle finish logic successfully and trigger persistence, websocket, and queue")
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
        @DisplayName("Should send game analysis event when handling finish logic")
        void shouldSendGameAnalysisEventWhenHandlingFinishLogic() {
            // Arrange
            String gameId = "room123";
            Game game = new Game(new Board());
            game.setWhitePlayerId(1L);
            game.setBlackPlayerId(2L);

            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            when(userRepository.findById(2L)).thenReturn(Optional.empty());
            when(gameRepository.saveAndFlush(any(GameEntity.class))).thenReturn(new GameEntity());

            // Act
            persistenceService.handleFinishLogic(gameId, game, GameResult.WHITE_WIN, GameStatus.CHECKMATE);

            // Assert
            verify(gameEventProducer, times(1)).sendGameForAnalysis(any(GameAnalysisMessage.class));
        }

        @Test
        @DisplayName("Should handle null users safely when finishing game")
        void shouldHandleNullUsersSafelyWhenFinishingGame() {
            // Arrange
            String gameId = "room123";
            Game game = new Game(new Board());
            game.setWhitePlayerId(null);
            game.setBlackPlayerId(-1L);

            when(gameRepository.saveAndFlush(any(GameEntity.class))).thenReturn(new GameEntity());

            // Act
            persistenceService.handleFinishLogic(gameId, game, GameResult.DRAW, GameStatus.STALEMATE);

            // Assert
            assertThat(game.getStatus()).isEqualTo(GameStatus.STALEMATE);
            verify(userRepository, never()).findById(anyLong());
            verify(gameRepository, times(1)).saveAndFlush(any(GameEntity.class));
            verify(webSocketController, times(1)).broadcastGameUpdate(gameId, game);
            verify(webSocketController, times(1)).sendGameOver(gameId, GameResult.DRAW);
        }
    }

    @Nested
    @DisplayName("Player Dismiss Operations")
    class PlayerDismissTests {

        @Test
        @DisplayName("Should process player dismiss for white player correctly")
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
        @DisplayName("Should process player dismiss for black player correctly")
        void shouldProcessPlayerDismissForBlackPlayer() {
            // Arrange
            String gameId = "room123";
            Long userId = 2L;
            Game game = new Game(new Board());
            game.setWhitePlayerId(1L);
            game.setBlackPlayerId(2L);
            game.setStatus(GameStatus.ACTIVE);

            when(sessionManager.getGame(gameId)).thenReturn(game);

            // Act
            persistenceService.processPlayerDismiss(gameId, userId);

            // Assert
            verify(persistenceSelf, times(1)).processGameFinish(gameId, GameResult.WHITE_WIN, GameStatus.ABANDONED);
            verify(persistenceSelf, times(1)).cleanupSession(gameId);
        }
    }

    @Nested
    @DisplayName("Session Cleanup & History Operations")
    class CleanupAndHistoryTests {

        @Test
        @DisplayName("Should cleanup session successfully")
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
        @DisplayName("Should get game history successfully for given user ID")
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
}
