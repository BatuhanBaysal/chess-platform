package com.batuhan.chess.api.dto.lobby;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MatchFoundMessage Unit Tests")
class MatchFoundMessageTest {

    private MatchFoundMessage createSampleMessage(String gameId) {
        return MatchFoundMessage.builder()
            .gameId(gameId)
            .status("STARTED")
            .color("WHITE")
            .opponentId(3L)
            .opponentName("grandmaster")
            .theme("wood")
            .build();
    }

    @Nested
    @DisplayName("Field Accessors")
    class FieldAccessorTests {

        @Test
        @DisplayName("Should build MatchFoundMessage with correct field values")
        void shouldBuildMatchFoundMessage() {
            // Act
            MatchFoundMessage message = createSampleMessage("game-999");

            // Assert
            assertThat(message).isNotNull();
            assertThat(message.gameId()).isEqualTo("game-999");
            assertThat(message.status()).isEqualTo("STARTED");
            assertThat(message.color()).isEqualTo("WHITE");
            assertThat(message.opponentId()).isEqualTo(3L);
            assertThat(message.opponentName()).isEqualTo("grandmaster");
            assertThat(message.theme()).isEqualTo("wood");
        }
    }

    @Nested
    @DisplayName("Equality and HashCode Contract")
    class EqualityTests {

        @Test
        @DisplayName("Should verify equality and hash code consistency for matching instances")
        void shouldVerifyEqualityAndHashCode() {
            // Arrange
            MatchFoundMessage message1 = createSampleMessage("game-999");
            MatchFoundMessage message2 = createSampleMessage("game-999");
            MatchFoundMessage differentMessage = createSampleMessage("game-000");

            // Act & Assert
            assertThat(message1)
                .isEqualTo(message2)
                .hasSameHashCodeAs(message2)
                .isNotEqualTo(differentMessage);
        }
    }
}
