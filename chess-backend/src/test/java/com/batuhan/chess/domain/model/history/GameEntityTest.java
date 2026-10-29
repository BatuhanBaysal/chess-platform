package com.batuhan.chess.domain.model.history;

import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.user.UserEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GameEntity Domain Model Tests")
class GameEntityTest {

    @Nested
    @DisplayName("Entity Mapping and Data Integrity")
    class MappingTests {

        @Test
        @DisplayName("Should retain all assigned properties when creating record via builder")
        void shouldRetainProperties_WhenCreatedViaBuilder() {
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
                .blackEloBefore(1200)
                .whiteEloGain(15)
                .blackEloGain(-15)
                .pgnData(pgn)
                .build();

            // Assert
            assertThat(game).isNotNull();
            assertThat(game.getWhitePlayer()).isEqualTo(white);
            assertThat(game.getBlackPlayer()).isEqualTo(black);
            assertThat(game.getResult()).isEqualTo(GameResult.WHITE_WIN);
            assertThat(game.getFinishMethod()).isEqualTo(GameStatus.CHECKMATE);
            assertThat(game.getWhiteEloBefore()).isEqualTo(1200);
            assertThat(game.getBlackEloBefore()).isEqualTo(1200);
            assertThat(game.getWhiteEloGain()).isEqualTo(15);
            assertThat(game.getBlackEloGain()).isEqualTo(-15);
            assertThat(game.getPgnData()).isEqualTo(pgn);
        }

        @Test
        @DisplayName("Should support full property mutation via setters and no-args constructor")
        void shouldSupportSetters_WhenUsingNoArgsConstructor() {
            // Arrange
            GameEntity game = new GameEntity();
            UserEntity white = new UserEntity();

            // Act
            game.setId(10L);
            game.setWhitePlayer(white);
            game.setResult(GameResult.DRAW);
            game.setFinishMethod(GameStatus.STALEMATE);

            // Assert
            assertThat(game.getId()).isEqualTo(10L);
            assertThat(game.getWhitePlayer()).isEqualTo(white);
            assertThat(game.getResult()).isEqualTo(GameResult.DRAW);
            assertThat(game.getFinishMethod()).isEqualTo(GameStatus.STALEMATE);
        }
    }

    @Nested
    @DisplayName("Lifecycle Hooks")
    class LifecycleTests {

        @Test
        @DisplayName("Should assign current UTC timestamp when playedAt is null during pre-persist")
        void shouldAssignTimestamp_WhenPlayedAtIsNullOnPrePersist() {
            // Arrange
            GameEntity game = new GameEntity();

            // Act
            ReflectionTestUtils.invokeMethod(game, "onCreate");

            // Assert
            assertThat(game.getPlayedAt())
                .isNotNull()
                .isBeforeOrEqualTo(LocalDateTime.now(ZoneOffset.UTC));
        }

        @Test
        @DisplayName("Should preserve existing timestamp when playedAt is already provided")
        void shouldPreserveTimestamp_WhenPlayedAtIsAlreadySet() {
            // Arrange
            LocalDateTime customPlayedAt = LocalDateTime.of(2025, 5, 20, 14, 30);
            GameEntity game = GameEntity.builder()
                .playedAt(customPlayedAt)
                .build();

            // Act
            ReflectionTestUtils.invokeMethod(game, "onCreate");

            // Assert
            assertThat(game.getPlayedAt()).isEqualTo(customPlayedAt);
        }
    }
}
