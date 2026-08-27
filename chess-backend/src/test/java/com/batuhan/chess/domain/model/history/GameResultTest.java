package com.batuhan.chess.domain.model.history;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GameResult Enum Logic Tests")
class GameResultTest {

    @ParameterizedTest
    @EnumSource(GameResult.class)
    @DisplayName("Should contain all expected game result states")
    void shouldContainAllGameResults(GameResult result) {
        // Act & Assert
        assertThat(GameResult.valueOf(result.name())).isEqualTo(result);
    }

    @Test
    @DisplayName("Should verify specific game result constants")
    void shouldVerifySpecificConstants() {
        // Act & Assert
        assertThat(GameResult.WHITE_WIN.name()).isEqualTo("WHITE_WIN");
        assertThat(GameResult.BLACK_WIN.name()).isEqualTo("BLACK_WIN");
        assertThat(GameResult.DRAW.name()).isEqualTo("DRAW");
        assertThat(GameResult.values()).hasSize(3);
    }
}
