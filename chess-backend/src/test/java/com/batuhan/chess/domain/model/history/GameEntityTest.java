package com.batuhan.chess.domain.model.history;

import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.user.UserEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Domain-level unit tests for GameEntity.
 * Ensures persistence integrity for game history, PGN records, and JPA lifecycle hooks.
 */
@DisplayName("Game Entity Domain Model Tests")
class GameEntityTest {

    @Nested
    @DisplayName("Entity Persistence and Mapping")
    class PersistenceTests {

        @Test
        @DisplayName("Should maintain data integrity when building a game history record")
        void shouldMaintainDataIntegrityOnBuild() {
            // Arrange
            UserEntity white = UserEntity.builder().username("white").build();
            UserEntity black = UserEntity.builder().username("black").build();
            String pgn = "1. e4 e5";

            // Act
            GameEntity game = GameEntity.builder()
                .whitePlayer(white)
                .blackPlayer(black)
                .result(GameResult.WHITE_WIN)
                .finishMethod(GameStatus.CHECKMATE)
                .whiteEloBefore(1200)
                .whiteEloGain(15)
                .pgnData(pgn)
                .build();

            // Assert
            assertThat(game).isNotNull().satisfies(g -> {
                assertThat(g.getWhitePlayer()).isEqualTo(white);
                assertThat(g.getBlackPlayer()).isEqualTo(black);
                assertThat(g.getResult()).isEqualTo(GameResult.WHITE_WIN);
                assertThat(g.getFinishMethod()).isEqualTo(GameStatus.CHECKMATE);
                assertThat(g.getPgnData()).isEqualTo(pgn);
                assertThat(g.getWhiteEloGain()).isEqualTo(15);
            });
        }
    }

    @Nested
    @DisplayName("Lifecycle Hooks")
    class LifecycleTests {

        @Test
        @DisplayName("Should automatically set playedAt timestamp during JPA pre-persist")
        void shouldSetPlayedAtOnPrePersist() {
            // Arrange
            GameEntity game = new GameEntity();

            // Act
            ReflectionTestUtils.invokeMethod(game, "onCreate");

            // Assert
            assertThat(game.getPlayedAt())
                .as("playedAt timestamp should be initialized before database insertion")
                .isNotNull()
                .isBeforeOrEqualTo(LocalDateTime.now());
        }
    }
}
