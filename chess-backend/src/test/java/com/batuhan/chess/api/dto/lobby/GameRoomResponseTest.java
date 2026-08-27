package com.batuhan.chess.api.dto.lobby;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GameRoomResponse Unit Tests")
class GameRoomResponseTest {

    @Test
    @DisplayName("Should build GameRoomResponse with correct field values")
    void shouldBuildGameRoomResponse() {
        // Arrange
        String roomId = "room-123";
        Long hostId = 1L;
        String hostName = "batuhan";
        Long blackPlayerId = 2L;
        String blackPlayerName = "opponent";
        String status = "WAITING";
        int timeLimit = 10;
        String theme = "modern";

        // Act
        GameRoomResponse response = GameRoomResponse.builder()
            .roomId(roomId)
            .hostId(hostId)
            .hostName(hostName)
            .blackPlayerId(blackPlayerId)
            .blackPlayerName(blackPlayerName)
            .status(status)
            .timeLimit(timeLimit)
            .theme(theme)
            .build();

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.roomId()).isEqualTo(roomId);
        assertThat(response.hostId()).isEqualTo(hostId);
        assertThat(response.hostName()).isEqualTo(hostName);
        assertThat(response.blackPlayerId()).isEqualTo(blackPlayerId);
        assertThat(response.blackPlayerName()).isEqualTo(blackPlayerName);
        assertThat(response.status()).isEqualTo(status);
        assertThat(response.timeLimit()).isEqualTo(timeLimit);
        assertThat(response.theme()).isEqualTo(theme);
    }
}
