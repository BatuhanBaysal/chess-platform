package com.batuhan.chess.api.dto.admin;

import com.batuhan.chess.domain.model.user.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AdminUserResponseDTO Unit Tests")
class AdminUserResponseDTOTest {

    @Test
    @DisplayName("Should build AdminUserResponseDTO with correct field values")
    void shouldBuildAdminUserResponseDTO() {
        // Arrange
        Long id = 10L;
        String username = "admin_batuhan";
        String email = "admin@chess.com";
        Integer eloRating = 1800;
        int wins = 50;
        int losses = 10;
        int draws = 5;
        UserRole role = UserRole.ROLE_ADMIN;
        LocalDateTime now = LocalDateTime.now();

        // Act
        AdminUserResponseDTO dto = AdminUserResponseDTO.builder()
            .id(id)
            .username(username)
            .email(email)
            .eloRating(eloRating)
            .totalWins(wins)
            .totalLosses(losses)
            .totalDraws(draws)
            .role(role)
            .createdAt(now)
            .build();

        // Assert
        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.username()).isEqualTo(username);
        assertThat(dto.email()).isEqualTo(email);
        assertThat(dto.eloRating()).isEqualTo(eloRating);
        assertThat(dto.totalWins()).isEqualTo(wins);
        assertThat(dto.totalLosses()).isEqualTo(losses);
        assertThat(dto.totalDraws()).isEqualTo(draws);
        assertThat(dto.role()).isEqualTo(role);
        assertThat(dto.createdAt()).isEqualTo(now);
    }
}
