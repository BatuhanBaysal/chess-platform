package com.batuhan.chess.domain.model.history;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GameResult Enum Tests")
class GameResultTest {

    @Nested
    @DisplayName("Enum Constants and Values")
    class EnumConstantTests {

        @ParameterizedTest
        @EnumSource(GameResult.class)
        @DisplayName("Should resolve enum constant correctly using valueOf")
        void shouldResolveEnumConstant_UsingValueOf(GameResult result) {
            // Act
            GameResult resolved = GameResult.valueOf(result.name());

            // Assert
            assertThat(resolved).isEqualTo(result);
        }

        @Test
        @DisplayName("Should declare exact set of expected game outcome constants")
        void shouldDeclareExactConstants() {
            // Act
            GameResult[] results = GameResult.values();

            // Assert
            assertThat(results)
                .containsExactly(GameResult.WHITE_WIN, GameResult.BLACK_WIN, GameResult.DRAW);
        }
    }
}
