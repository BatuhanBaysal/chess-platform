package com.batuhan.chess.api.dto.admin;

import com.batuhan.chess.domain.model.chess.GameStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AdminActiveGameResponseDTO Unit Tests")
class AdminActiveGameResponseDTOTest {

    @Test
    @DisplayName("Should build AdminActiveGameResponseDTO with correct field values")
    void shouldBuildAdminActiveGameResponseDTO() {
        // Arrange
        String gameId = "game-123";
        Long whitePlayerId = 1L;
        Long blackPlayerId = 2L;
        GameStatus status = GameStatus.ACTIVE;
        long whiteTime = 300000L;
        long blackTime = 250000L;

        // Act
        AdminActiveGameResponseDTO dto = AdminActiveGameResponseDTO.builder()
            .gameId(gameId)
            .whitePlayerId(whitePlayerId)
            .blackPlayerId(blackPlayerId)
            .status(status)
            .whiteRemainingTimeMs(whiteTime)
            .blackRemainingTimeMs(blackTime)
            .build();

        // Assert
        assertThat(dto).isNotNull();
        assertThat(dto.gameId()).isEqualTo(gameId);
        assertThat(dto.whitePlayerId()).isEqualTo(whitePlayerId);
        assertThat(dto.blackPlayerId()).isEqualTo(blackPlayerId);
        assertThat(dto.status()).isEqualTo(status);
        assertThat(dto.whiteRemainingTimeMs()).isEqualTo(whiteTime);
        assertThat(dto.blackRemainingTimeMs()).isEqualTo(blackTime);
    }
}
