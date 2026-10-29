package com.batuhan.chess.api.dto.game;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GameExportResponse Record Tests")
class GameExportResponseTest {

    @Test
    @DisplayName("Should initialize fields correctly and return matching values")
    void shouldInitializeFieldsCorrectly() {
        // Arrange
        String gameId = "game-101";
        String storageKey = "matches/artifacts/game-101/summary.txt";
        String fileName = "summary.txt";
        long sizeInBytes = 2048L;

        // Act
        GameExportResponse response = new GameExportResponse(gameId, storageKey, fileName, sizeInBytes);

        // Assert
        assertThat(response.gameId()).isEqualTo(gameId);
        assertThat(response.storageKey()).isEqualTo(storageKey);
        assertThat(response.fileName()).isEqualTo(fileName);
        assertThat(response.sizeInBytes()).isEqualTo(sizeInBytes);
    }

    @Test
    @DisplayName("Should verify equality and hash code consistency")
    void shouldVerifyEqualityAndHashCode() {
        // Arrange
        GameExportResponse response1 = new GameExportResponse("g1", "key/path", "log.txt", 512L);
        GameExportResponse response2 = new GameExportResponse("g1", "key/path", "log.txt", 512L);
        GameExportResponse differentResponse = new GameExportResponse("g2", "key/path2", "log.txt", 512L);

        // Act & Assert
        assertThat(response1)
            .isEqualTo(response2)
            .hasSameHashCodeAs(response2)
            .isNotEqualTo(differentResponse);
    }

    @Test
    @DisplayName("Should include field values in toString output")
    void shouldContainFieldValuesInToString() {
        // Arrange
        GameExportResponse response = new GameExportResponse("g1", "key/path", "log.txt", 100L);

        // Act
        String result = response.toString();

        // Assert
        assertThat(result)
            .contains("gameId=g1")
            .contains("storageKey=key/path")
            .contains("fileName=log.txt")
            .contains("sizeInBytes=100");
    }
}
