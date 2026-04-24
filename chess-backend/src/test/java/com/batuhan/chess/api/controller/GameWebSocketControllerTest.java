package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.MoveRequest;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.Board;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit test suite for GameWebSocketController.
 * Validates real-time game interactions including player readiness,
 * move processing, timeout handling, and STOMP message broadcasting.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Game WebSocket Controller Technical Tests")
class GameWebSocketControllerTest {

    @Mock
    private GameService gameService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private GameWebSocketController webSocketController;

    @Nested
    @DisplayName("Player Readiness Logic")
    class ReadyTests {

        @Test
        @DisplayName("Should broadcast game update when both players are confirmed ready")
        void shouldBroadcastWhenBothPlayersAreReady() {
            // Arrange
            String gameId = "game-123";
            Long userId = 1L;
            var request = new GameWebSocketController.ReadyRequest();
            request.setGameId(gameId);
            request.setUserId(userId);

            Game game = new Game(new Board());
            when(gameService.setPlayerReady(gameId, userId)).thenReturn(true);
            when(gameService.getGame(gameId)).thenReturn(game);
            when(gameService.isGameStarted(gameId)).thenReturn(true);

            // Act
            webSocketController.processReady(request);

            // Assert
            verify(messagingTemplate).convertAndSend(eq("/topic/game/" + gameId), any(GameResponse.class));
        }

        @Test
        @DisplayName("Should not broadcast when only one player has confirmed readiness")
        void shouldNotBroadcastWhenOnlyOnePlayerIsReady() {
            // Arrange
            var request = new GameWebSocketController.ReadyRequest();
            request.setGameId("game-123");
            request.setUserId(1L);

            when(gameService.setPlayerReady(anyString(), anyLong())).thenReturn(false);

            // Act
            webSocketController.processReady(request);

            // Assert
            verifyNoInteractions(messagingTemplate);
        }
    }

    @Nested
    @DisplayName("Move and Timeout Processing")
    class GameFlowTests {

        @Test
        @DisplayName("Should execute move and broadcast updated board state to all subscribers")
        void shouldProcessMoveAndBroadcastUpdate() {
            // Arrange
            String gameId = "game-123";
            var request = new MoveRequest(gameId, 0, 1, 0, 2, null);
            Game game = new Game(new Board());

            when(gameService.makeMove(eq(gameId), any(), any(), any())).thenReturn(List.of());
            when(gameService.getGame(gameId)).thenReturn(game);

            // Act
            webSocketController.processMove(request);

            // Assert
            verify(gameService).makeMove(eq(gameId), any(), any(), any());
            verify(messagingTemplate).convertAndSend(eq("/topic/game/" + gameId), any(GameResponse.class));
        }

        @Test
        @DisplayName("Should finish game and broadcast result when a player times out")
        void shouldProcessTimeoutAndBroadcastFinish() {
            // Arrange
            String gameId = "game-123";
            var request = new MoveRequest(gameId, 0, 0, 0, 0, null);
            Game game = new Game(new Board());

            when(gameService.getGame(gameId)).thenReturn(game);

            // Act
            webSocketController.processTimeout(request);

            // Assert
            verify(gameService).processGameFinish(eq(gameId), any(), eq(GameStatus.TIMEOUT));
            verify(messagingTemplate).convertAndSend(eq("/topic/game/" + gameId), any(GameResponse.class));
        }

        @Test
        @DisplayName("Should ignore timeout requests if the game is already in a terminal state")
        void shouldIgnoreTimeoutIfGameIsAlreadyFinished() {
            // Arrange
            String gameId = "game-123";
            var request = new MoveRequest(gameId, 0, 0, 0, 0, null);
            Game game = new Game(new Board());
            game.setStatus(GameStatus.CHECKMATE);

            when(gameService.getGame(gameId)).thenReturn(game);

            // Act
            webSocketController.processTimeout(request);

            // Assert
            verify(gameService, never()).processGameFinish(anyString(), any(), any());
            verify(messagingTemplate, never()).convertAndSend(anyString(), any(GameResponse.class));
        }
    }

    @Nested
    @DisplayName("Exception Handling and Guard Clauses")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should return specific error message in map when an exception occurs")
        void shouldReturnErrorMapWithDetailedMessage() {
            // Arrange
            Exception exception = new RuntimeException("Operational Failure");

            // Act
            Map<String, String> result = webSocketController.handleException(exception);

            // Assert
            assertThat(result)
                .containsEntry("error", "Operational Failure")
                .hasSize(1);
        }

        @Test
        @DisplayName("Should return generic error message when exception message is null")
        void shouldReturnGenericMessageOnNullErrorException() {
            // Arrange
            Exception exception = new RuntimeException((String) null);

            // Act
            Map<String, String> result = webSocketController.handleException(exception);

            // Assert
            assertThat(result).containsEntry("error", "An error occurred");
        }

        @Test
        @DisplayName("Should abort broadcasting if game state becomes null during processing")
        void shouldHandleNullGameGracefully() {
            // Arrange
            var request = new MoveRequest("invalid-game", 0, 1, 0, 2, null);
            when(gameService.getGame(anyString())).thenReturn(null);

            // Act
            webSocketController.processMove(request);

            // Assert
            verify(messagingTemplate, never()).convertAndSend(anyString(), any(GameResponse.class));
        }
    }
}
