package com.batuhan.chess.api.dto.auth;

import com.batuhan.chess.domain.model.user.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AuthResponse Unit Tests")
class AuthResponseTest {

    @Test
    @DisplayName("Should build AuthResponse with correct field values")
    void shouldBuildAuthResponse() {
        // Arrange
        Long id = 1L;
        String token = "jwt-mock-token-xyz";
        String username = "batuhan";
        String email = "batuhan@chess.com";
        Integer eloRating = 1600;
        UserRole role = UserRole.ROLE_ADMIN;

        // Act
        AuthResponse response = AuthResponse.builder()
            .id(id)
            .token(token)
            .username(username)
            .email(email)
            .eloRating(eloRating)
            .role(role)
            .build();

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(id);
        assertThat(response.token()).isEqualTo(token);
        assertThat(response.username()).isEqualTo(username);
        assertThat(response.email()).isEqualTo(email);
        assertThat(response.eloRating()).isEqualTo(eloRating);
        assertThat(response.role()).isEqualTo(role);
    }
}
