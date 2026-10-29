package com.batuhan.chess.domain.model.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("UserRole Enum Tests")
class UserRoleTest {

    @Nested
    @DisplayName("Constants and String Mappings")
    class ConstantMappingTests {

        @ParameterizedTest(name = "UserRole.{0} corresponds to string constant \"{1}\"")
        @CsvSource({
            "ROLE_ADMIN, ADMIN",
            "ROLE_USER, USER",
            "ROLE_GUEST, GUEST"
        })
        @DisplayName("Should expose correct string constant values matching role names")
        void shouldExposeCorrectStringConstants(UserRole role, String expectedConstant) {
            // Act & Assert
            switch (role) {
                case ROLE_ADMIN -> assertThat(UserRole.ADMIN).isEqualTo(expectedConstant);
                case ROLE_USER -> assertThat(UserRole.USER).isEqualTo(expectedConstant);
                case ROLE_GUEST -> assertThat(UserRole.GUEST).isEqualTo(expectedConstant);
            }
        }

        @ParameterizedTest
        @EnumSource(UserRole.class)
        @DisplayName("Should resolve enum constant correctly using valueOf")
        void shouldResolveEnumConstant_UsingValueOf(UserRole role) {
            // Act
            UserRole resolved = UserRole.valueOf(role.name());

            // Assert
            assertThat(resolved).isEqualTo(role);
        }

        @Test
        @DisplayName("Should declare exactly three user roles")
        void shouldDeclareExactRoleCount() {
            // Act
            UserRole[] roles = UserRole.values();

            // Assert
            assertThat(roles).containsExactly(UserRole.ROLE_ADMIN, UserRole.ROLE_USER, UserRole.ROLE_GUEST);
        }
    }
}
