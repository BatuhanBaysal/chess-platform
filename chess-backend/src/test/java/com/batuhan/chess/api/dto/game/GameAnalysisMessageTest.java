package com.batuhan.chess.api.dto.game;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GameAnalysisMessage Record Tests")
class GameAnalysisMessageTest {

    private GameAnalysisMessage createSampleMessage(String gameId) {
        return new GameAnalysisMessage(
            gameId,
            "1. e4 e5",
            List.of("e4", "e5"),
            1L,
            2L
        );
    }

    @Nested
    @DisplayName("Field Accessors")
    class FieldAccessorTests {

        @Test
        @DisplayName("Should store and return correct record field values")
        void shouldStoreAndReturnCorrectValues() {
            // Arrange
            String gameId = "game-123";
            String pgn = "1. e4 e5";
            List<String> moves = List.of("e4", "e5");
            Long whiteId = 1L;
            Long blackId = 2L;

            // Act
            GameAnalysisMessage message = new GameAnalysisMessage(gameId, pgn, moves, whiteId, blackId);

            // Assert
            assertThat(message.gameId()).isEqualTo(gameId);
            assertThat(message.pgn()).isEqualTo(pgn);
            assertThat(message.moves()).isEqualTo(moves);
            assertThat(message.whitePlayerId()).isEqualTo(whiteId);
            assertThat(message.blackPlayerId()).isEqualTo(blackId);
        }
    }

    @Nested
    @DisplayName("Equality and HashCode Contract")
    class EqualityTests {

        @Test
        @DisplayName("Should verify equality and hash code consistency for matching instances")
        void shouldVerifyEqualityAndHashCode() {
            // Arrange
            GameAnalysisMessage message1 = createSampleMessage("game-123");
            GameAnalysisMessage message2 = createSampleMessage("game-123");
            GameAnalysisMessage differentMessage = createSampleMessage("game-999");

            // Act & Assert
            assertThat(message1)
                .isEqualTo(message2)
                .hasSameHashCodeAs(message2)
                .isNotEqualTo(differentMessage);
        }
    }
}
