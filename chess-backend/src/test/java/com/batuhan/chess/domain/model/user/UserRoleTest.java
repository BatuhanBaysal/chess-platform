package com.batuhan.chess.domain.model.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("UserRole Enum Logic Tests")
class UserRoleTest {

    @ParameterizedTest(name = "UserRole {0} should map constant string {1}")
    @CsvSource({
        "ROLE_ADMIN, ADMIN",
        "ROLE_USER, USER",
        "ROLE_GUEST, GUEST"
    })
    @DisplayName("Should expose correct string constant values")
    void shouldHaveCorrectConstants(UserRole role, String expectedConstant) {
        // Act & Assert
        switch (role) {
            case ROLE_ADMIN -> assertThat(UserRole.ADMIN).isEqualTo(expectedConstant);
            case ROLE_USER -> assertThat(UserRole.USER).isEqualTo(expectedConstant);
            case ROLE_GUEST -> assertThat(UserRole.GUEST).isEqualTo(expectedConstant);
        }
    }

    @ParameterizedTest
    @EnumSource(UserRole.class)
    @DisplayName("Should contain all defined roles via valueOf")
    void shouldContainAllRoles(UserRole role) {
        // Act & Assert
        assertThat(UserRole.valueOf(role.name())).isEqualTo(role);
    }

    @Test
    @DisplayName("Should contain expected number of roles")
    void shouldHaveCorrectSize() {
        // Act & Assert
        assertThat(UserRole.values()).hasSize(3);
    }
}
