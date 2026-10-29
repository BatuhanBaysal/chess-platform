package com.batuhan.chess.api.dto.lobby;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GameRoomResponse Unit Tests")
class GameRoomResponseTest {

    private GameRoomResponse createSampleResponse(String roomId) {
        return GameRoomResponse.builder()
            .roomId(roomId)
            .hostId(1L)
            .hostName("batuhan")
            .blackPlayerId(2L)
            .blackPlayerName("opponent")
            .status("WAITING")
            .timeLimit(10)
            .theme("modern")
            .build();
    }

    @Nested
    @DisplayName("Field Accessors")
    class FieldAccessorTests {

        @Test
        @DisplayName("Should build GameRoomResponse with correct field values")
        void shouldBuildGameRoomResponse() {
            // Act
            GameRoomResponse response = createSampleResponse("room-123");

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.roomId()).isEqualTo("room-123");
            assertThat(response.hostId()).isEqualTo(1L);
            assertThat(response.hostName()).isEqualTo("batuhan");
            assertThat(response.blackPlayerId()).isEqualTo(2L);
            assertThat(response.blackPlayerName()).isEqualTo("opponent");
            assertThat(response.status()).isEqualTo("WAITING");
            assertThat(response.timeLimit()).isEqualTo(10);
            assertThat(response.theme()).isEqualTo("modern");
        }
    }

    @Nested
    @DisplayName("Equality and HashCode Contract")
    class EqualityTests {

        @Test
        @DisplayName("Should verify equality and hash code consistency for matching instances")
        void shouldVerifyEqualityAndHashCode() {
            // Arrange
            GameRoomResponse response1 = createSampleResponse("room-123");
            GameRoomResponse response2 = createSampleResponse("room-123");
            GameRoomResponse differentResponse = createSampleResponse("room-999");

            // Act & Assert
            assertThat(response1)
                .isEqualTo(response2)
                .hasSameHashCodeAs(response2)
                .isNotEqualTo(differentResponse);
        }
    }
}
