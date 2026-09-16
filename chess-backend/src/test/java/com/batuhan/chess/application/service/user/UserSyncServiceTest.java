package com.batuhan.chess.application.service.user;

import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Synchronization Service Unit Tests")
class UserSyncServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserSyncService userSyncService;

    @Nested
    @DisplayName("Role Resolution & User Persistence")
    class RoleResolutionTests {

        @Test
        @DisplayName("Should resolve ROLE_ADMIN when ADMIN role is present in realm_access")
        void shouldResolveAdminRole() {
            // Arrange
            UUID sub = UUID.randomUUID();
            String username = "adminUser";
            String email = "admin@chess.com";
            Jwt jwt = createJwt(sub.toString(), email, List.of("ADMIN"));
            when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            userSyncService.syncKeycloakUser(jwt, username);

            // Assert
            ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
            verify(userRepository).save(captor.capture());
            UserEntity saved = captor.getValue();

            assertThat(saved.getUsername()).isEqualTo(username);
            assertThat(saved.getEmail()).isEqualTo(email);
            assertThat(saved.getExternalId()).isEqualTo(sub);
            assertThat(saved.getRole()).isEqualTo(UserRole.ROLE_ADMIN);
            assertThat(saved.isGuest()).isFalse();
            assertThat(saved.getEloRating()).isEqualTo(1200);
            assertThat(saved.isActive()).isTrue();
        }

        @Test
        @DisplayName("Should resolve ROLE_GUEST and set isGuest true when GUEST role is present")
        void shouldResolveGuestRole() {
            // Arrange
            UUID sub = UUID.randomUUID();
            String username = "guestUser";
            String email = "guest@chess.com";
            Jwt jwt = createJwt(sub.toString(), email, List.of("GUEST"));
            when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            userSyncService.syncKeycloakUser(jwt, username);

            // Assert
            ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
            verify(userRepository).save(captor.capture());
            UserEntity saved = captor.getValue();

            assertThat(saved.getRole()).isEqualTo(UserRole.ROLE_GUEST);
            assertThat(saved.isGuest()).isTrue();
        }

        @Test
        @DisplayName("Should flag isGuest true if username starts with guest_ even without GUEST role")
        void shouldFlagGuestWhenUsernamePrefixMatches() {
            // Arrange
            UUID sub = UUID.randomUUID();
            String username = "guest_998877";
            Jwt jwt = createJwt(sub.toString(), "temp@chess.com", Collections.emptyList());
            when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            userSyncService.syncKeycloakUser(jwt, username);

            // Assert
            ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
            verify(userRepository).save(captor.capture());
            UserEntity saved = captor.getValue();

            assertThat(saved.isGuest()).isTrue();
            assertThat(saved.getRole()).isEqualTo(UserRole.ROLE_USER);
        }

        @Test
        @DisplayName("Should default to ROLE_USER when no special role is specified")
        void shouldDefaultToUserRole() {
            // Arrange
            UUID sub = UUID.randomUUID();
            String username = "normalUser";
            Jwt jwt = createJwt(sub.toString(), "player@chess.com", List.of("OTHER_ROLE"));
            when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            userSyncService.syncKeycloakUser(jwt, username);

            // Assert
            ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
            verify(userRepository).save(captor.capture());
            UserEntity saved = captor.getValue();

            assertThat(saved.getRole()).isEqualTo(UserRole.ROLE_USER);
            assertThat(saved.isGuest()).isFalse();
        }
    }

    @Nested
    @DisplayName("Fallback and Default Value Handling")
    class FallbackTests {

        @Test
        @DisplayName("Should generate default email fallback when email claim is null")
        void shouldGenerateFallbackEmailWhenNull() {
            // Arrange
            UUID sub = UUID.randomUUID();
            String username = "noEmailUser";
            Jwt jwt = new Jwt(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", sub.toString())
            );
            when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            userSyncService.syncKeycloakUser(jwt, username);

            // Assert
            ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
            verify(userRepository).save(captor.capture());
            UserEntity saved = captor.getValue();

            assertThat(saved.getEmail()).isEqualTo("noEmailUser@chessplatform.local");
        }

        @Test
        @DisplayName("Should generate random UUID when sub is not a valid UUID string")
        void shouldGenerateRandomUuidOnInvalidSub() {
            // Arrange
            String username = "invalidSubUser";
            Jwt jwt = new Jwt(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "non-uuid-string-identifier", "email", "invalid@chess.com")
            );
            when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            userSyncService.syncKeycloakUser(jwt, username);

            // Assert
            ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
            verify(userRepository).save(captor.capture());
            UserEntity saved = captor.getValue();

            assertThat(saved.getExternalId()).isNotNull();
        }
    }

    private Jwt createJwt(String sub, String email, List<String> roles) {
        return new Jwt(
            "token-value",
            Instant.now(),
            Instant.now().plusSeconds(60),
            Map.of("alg", "none"),
            Map.of(
                "sub", sub,
                "email", email,
                "realm_access", Map.of("roles", roles)
            )
        );
    }
}
