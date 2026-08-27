package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Color Enum Logic Tests")
class ColorTest {

    @Test
    @DisplayName("Should return opposite color correctly")
    void shouldReturnOppositeColor() {
        // Act & Assert
        assertThat(Color.WHITE.opposite()).isEqualTo(Color.BLACK);
        assertThat(Color.BLACK.opposite()).isEqualTo(Color.WHITE);
    }

    @Test
    @DisplayName("Should correctly map string names to enum constants via valueOf")
    void shouldMapCorrectlyViaValueOf() {
        // Act & Assert
        assertThat(Color.valueOf("WHITE")).isEqualTo(Color.WHITE);
        assertThat(Color.valueOf("BLACK")).isEqualTo(Color.BLACK);
        assertThat(Color.values()).contains(Color.WHITE, Color.BLACK);
    }
}
