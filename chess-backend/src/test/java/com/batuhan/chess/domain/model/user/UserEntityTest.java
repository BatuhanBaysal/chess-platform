package com.batuhan.chess.domain.model.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("UserEntity Domain Model Tests")
class UserEntityTest {

    @Nested
    @DisplayName("Initialization and Defaults")
    class InitializationTests {

        @Test
        @DisplayName("Should apply standard defaults when creating user via builder")
        void shouldApplyDefaults_WhenCreatingViaBuilder() {
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
            assertThat(user.getUsername()).isEqualTo(username);
            assertThat(user.getEmail()).isEqualTo(email);
            assertThat(user.getExternalId()).isNotNull();
            assertThat(user.getEloRating()).isEqualTo(1200);
            assertThat(user.getTotalWins()).isZero();
            assertThat(user.getTotalLosses()).isZero();
            assertThat(user.getTotalDraws()).isZero();
            assertThat(user.isGuest()).isFalse();
            assertThat(user.isActive()).isTrue();
            assertThat(user.getPassword()).isNull();
            assertThat(user.getRole()).isEqualTo(UserRole.ROLE_USER);
        }

        @Test
        @DisplayName("Should configure guest user with guest role and isGuest flag set to true")
        void shouldConfigureGuestUser_WhenIsGuestIsTrue() {
            // Arrange & Act
            UserEntity guest = UserEntity.builder()
                .username("guest_12345678")
                .email("guest_12345678@chessplatform.local")
                .role(UserRole.ROLE_GUEST)
                .isGuest(true)
                .password(null)
                .build();

            // Assert
            assertThat(guest.isGuest()).isTrue();
            assertThat(guest.getPassword()).isNull();
            assertThat(guest.getRole()).isEqualTo(UserRole.ROLE_GUEST);
            assertThat(guest.isActive()).isTrue();
        }

        @Test
        @DisplayName("Should support mutation using no-args constructor and setters")
        void shouldSupportSetters_WhenUsingNoArgsConstructor() {
            // Arrange
            UserEntity user = new UserEntity();

            // Act
            user.setId(5L);
            user.setUsername("customUser");
            user.setEmail("custom@chess.com");
            user.setEloRating(1600);
            user.setActive(false);

            // Assert
            assertThat(user.getId()).isEqualTo(5L);
            assertThat(user.getUsername()).isEqualTo("customUser");
            assertThat(user.getEmail()).isEqualTo("custom@chess.com");
            assertThat(user.getEloRating()).isEqualTo(1600);
            assertThat(user.isActive()).isFalse();
        }
    }

    @Nested
    @DisplayName("Total Games Calculation")
    class TotalGamesTests {

        @Test
        @DisplayName("Should return the accurate sum of wins, losses, and draws")
        void shouldCalculateTotalGames_WhenStatsAreNonZero() {
            // Arrange
            UserEntity user = new UserEntity();
            user.setTotalWins(5);
            user.setTotalLosses(3);
            user.setTotalDraws(2);

            // Act
            int totalGames = user.getTotalGames();

            // Assert
            assertThat(totalGames).isEqualTo(10);
        }

        @Test
        @DisplayName("Should return zero total games when all match counters are zero")
        void shouldReturnZero_WhenAllCountersAreZero() {
            // Arrange
            UserEntity user = new UserEntity();

            // Act
            int totalGames = user.getTotalGames();

            // Assert
            assertThat(totalGames).isZero();
        }
    }

    @Nested
    @DisplayName("Lifecycle Hooks")
    class LifecycleTests {

        @Test
        @DisplayName("Should assign current UTC timestamp when createdAt is null during pre-persist")
        void shouldAssignTimestamp_WhenCreatedAtIsNullOnPrePersist() {
            // Arrange
            UserEntity user = new UserEntity();

            // Act
            ReflectionTestUtils.invokeMethod(user, "onCreate");

            // Assert
            assertThat(user.getCreatedAt())
                .isNotNull()
                .isBeforeOrEqualTo(LocalDateTime.now(ZoneOffset.UTC));
        }

        @Test
        @DisplayName("Should preserve existing timestamp when createdAt is already provided")
        void shouldPreserveTimestamp_WhenCreatedAtIsAlreadySet() {
            // Arrange
            LocalDateTime customCreatedAt = LocalDateTime.of(2024, 1, 15, 10, 0);
            UserEntity user = UserEntity.builder()
                .createdAt(customCreatedAt)
                .build();

            // Act
            ReflectionTestUtils.invokeMethod(user, "onCreate");

            // Assert
            assertThat(user.getCreatedAt()).isEqualTo(customCreatedAt);
        }
    }
}
