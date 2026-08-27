package com.batuhan.chess.api.dto.user;

import com.batuhan.chess.domain.model.user.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("UserResponseDTO Unit Tests")
class UserResponseDTOTest {

    @Test
    @DisplayName("Should build UserResponseDTO with correct field values")
    void shouldBuildUserResponseDTO() {
        // Arrange
        String username = "batuhan";
        String email = "batuhan@chess.com";
        Integer eloRating = 1750;
        int totalWins = 30;
        int totalLosses = 10;
        int totalDraws = 5;
        int totalGames = 45;
        UserRole role = UserRole.ROLE_ADMIN;

        // Act
        UserResponseDTO response = UserResponseDTO.builder()
            .username(username)
            .email(email)
            .eloRating(eloRating)
            .totalWins(totalWins)
            .totalLosses(totalLosses)
            .totalDraws(totalDraws)
            .totalGames(totalGames)
            .role(role)
            .build();

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.username()).isEqualTo(username);
        assertThat(response.email()).isEqualTo(email);
        assertThat(response.eloRating()).isEqualTo(eloRating);
        assertThat(response.totalWins()).isEqualTo(totalWins);
        assertThat(response.totalLosses()).isEqualTo(totalLosses);
        assertThat(response.totalDraws()).isEqualTo(totalDraws);
        assertThat(response.totalGames()).isEqualTo(totalGames);
        assertThat(response.role()).isEqualTo(role);
    }
}
