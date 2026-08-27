package com.batuhan.chess.api.dto.lobby;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MatchFoundMessage Unit Tests")
class MatchFoundMessageTest {

    @Test
    @DisplayName("Should build MatchFoundMessage with correct field values")
    void shouldBuildMatchFoundMessage() {
        // Arrange
        String gameId = "game-999";
        String status = "STARTED";
        String color = "WHITE";
        Long opponentId = 3L;
        String opponentName = "grandmaster";
        String theme = "wood";

        // Act
        MatchFoundMessage message = MatchFoundMessage.builder()
            .gameId(gameId)
            .status(status)
            .color(color)
            .opponentId(opponentId)
            .opponentName(opponentName)
            .theme(theme)
            .build();

        // Assert
        assertThat(message).isNotNull();
        assertThat(message.gameId()).isEqualTo(gameId);
        assertThat(message.status()).isEqualTo(status);
        assertThat(message.color()).isEqualTo(color);
        assertThat(message.opponentId()).isEqualTo(opponentId);
        assertThat(message.opponentName()).isEqualTo(opponentName);
        assertThat(message.theme()).isEqualTo(theme);
    }
}
