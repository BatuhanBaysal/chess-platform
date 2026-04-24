package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameResponse;
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

import java.util.List;
import java.util.Optional;

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

    @Spy
    private MeterRegistry meterRegistry = new SimpleMeterRegistry();

    @InjectMocks
    private GameService gameService;

    private final Long whiteId = 1L;
    private final Long blackId = 2L;
    private String gameId;

    @BeforeEach
    void setUp() {
        gameService.initMetrics();
        gameId = gameService.createGame(whiteId, blackId);
        gameService.setSelf(gameService);
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
            assertThat(newGameId).isNotBlank().hasSize(8);
            assertThat(gameService.getGame(newGameId)).satisfies(game -> {
                assertThat(game.getWhitePlayerId()).isEqualTo(p1);
                assertThat(game.getBlackPlayerId()).isEqualTo(p2);
            });
        }

        @Test
        @DisplayName("Should correctly track player readiness flow before starting the game")
        void shouldManagePlayerReadinessFlow() {
            // Act & Assert
            boolean whiteReady = gameService.setPlayerReady(gameId, whiteId);
            assertThat(whiteReady).as("First player ready should not start game").isFalse();
            assertThat(gameService.isGameStarted(gameId)).isFalse();

            boolean blackReady = gameService.setPlayerReady(gameId, blackId);
            assertThat(blackReady).as("Second player ready should start game").isTrue();
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
        @DisplayName("Should throw IllegalStateException when moving in a finished game")
        void shouldPreventMoveInFinishedGame() {
            // Arrange
            gameService.setPlayerReady(gameId, whiteId);
            gameService.setPlayerReady(gameId, blackId);
            gameService.getGame(gameId).setStatus(GameStatus.CHECKMATE);
            Position pos = new Position(4, 1);

            // Act & Assert
            assertThatThrownBy(() -> gameService.makeMove(gameId, pos, pos, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("finished game");
        }
    }

    @Nested
    @DisplayName("Post-Game Processing & Elo Updates")
    class PostGameTests {

        @Test
        @DisplayName("Should update user statistics and persist game history on finish")
        void shouldProcessGameFinishCorrectly() {
            // Arrange
            UserEntity white = UserEntity.builder().id(whiteId).eloRating(1200).totalWins(0).build();
            UserEntity black = UserEntity.builder().id(blackId).eloRating(1200).totalLosses(0).build();

            when(userRepository.findById(whiteId)).thenReturn(Optional.of(white));
            when(userRepository.findById(blackId)).thenReturn(Optional.of(black));
            when(eloService.calculateGain(anyInt(), anyInt(), anyDouble())).thenReturn(25);

            // Act
            gameService.processGameFinish(gameId, GameResult.WHITE_WIN, GameStatus.CHECKMATE);

            // Assert
            assertThat(white.getEloRating()).as("White Elo should increase").isEqualTo(1225);
            assertThat(white.getTotalWins()).as("White wins should increment").isEqualTo(1);
            assertThat(black.getTotalLosses()).as("Black losses should increment").isEqualTo(1);
            verify(gameRepository).save(any(GameEntity.class));
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
}
