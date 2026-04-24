package com.batuhan.chess.domain.model.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Domain-level unit tests for UserEntity.
 * Validates builder defaults, statistical calculations, and JPA lifecycle hooks.
 */
@DisplayName("User Entity Domain Model Tests")
class UserEntityTest {

    @Nested
    @DisplayName("Constructor and Builder Logic")
    class InitializationTests {

        @Test
        @DisplayName("Should apply business default values when creating a new user via builder")
        void shouldApplyDefaultValuesOnBuild() {
            // Arrange
            String username = "batuhan";
            String email = "batuhan@chess.com";

            // Act
            UserEntity user = UserEntity.builder()
                .username(username)
                .email(email)
                .role(UserRole.ROLE_USER)
                .build();

            // Assert
            assertThat(user).isNotNull().satisfies(u -> {
                assertThat(u.getUsername()).isEqualTo(username);
                assertThat(u.getExternalId()).isNotNull();
                assertThat(u.getEloRating()).isEqualTo(1200);
                assertThat(u.getTotalWins()).isZero();
                assertThat(u.getTotalLosses()).isZero();
                assertThat(u.getTotalDraws()).isZero();
                assertThat(u.isGuest()).isFalse();
            });
        }
    }

    @Nested
    @DisplayName("Statistical Business Logic")
    class StatisticsTests {

        @Test
        @DisplayName("Should return the correct sum of all game results")
        void shouldCalculateTotalGamesCorrectly() {
            // Arrange
            UserEntity user = new UserEntity();
            user.setTotalWins(5);
            user.setTotalLosses(3);
            user.setTotalDraws(2);

            // Act
            int totalGames = user.getTotalGames();

            // Assert
            assertThat(totalGames)
                .as("Total games should be the sum of wins, losses, and draws")
                .isEqualTo(10);
        }
    }

    @Nested
    @DisplayName("Lifecycle and Persistence Hooks")
    class LifecycleTests {

        @Test
        @DisplayName("Should initialize createdAt timestamp before persisting to database")
        void shouldSetCreatedAtOnPrePersist() {
            // Arrange
            UserEntity user = new UserEntity();

            // Act
            ReflectionTestUtils.invokeMethod(user, "onCreate");

            // Assert
            assertThat(user.getCreatedAt())
                .isNotNull()
                .isBeforeOrEqualTo(LocalDateTime.now());
        }
    }
}
