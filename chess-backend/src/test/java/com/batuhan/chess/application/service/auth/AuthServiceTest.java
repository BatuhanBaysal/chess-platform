package com.batuhan.chess.application.service.auth;

import com.batuhan.chess.api.dto.auth.LoginRequest;
import com.batuhan.chess.api.dto.auth.RegisterRequest;
import com.batuhan.chess.api.exception.EmailAlreadyExistsException;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.api.exception.UserAlreadyExistsException;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Authentication Service Business Logic Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("batuhan", "batuhan@chess.com", "Password123");
        loginRequest = new LoginRequest("batuhan", "Password123");

        testUser = UserEntity.builder()
            .id(1L)
            .username("batuhan")
            .email("batuhan@chess.com")
            .password("encodedPassword")
            .role(UserRole.ROLE_USER)
            .eloRating(1200)
            .active(true)
            .build();

        ReflectionTestUtils.setField(authService, "guestClientId", "chess-guest-client");
        ReflectionTestUtils.setField(authService, "guestClientSecret", "");
        ReflectionTestUtils.setField(authService, "keycloakServerUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(authService, "keycloakTokenUri", "http://localhost:8081/realms/chess-realm/protocol/openid-connect/token");
        ReflectionTestUtils.setField(authService, "keycloakAdminUsername", "admin");
        ReflectionTestUtils.setField(authService, "keycloakAdminPassword", "admin");
    }

    @Nested
    @DisplayName("User Registration Logic")
    class RegistrationTests {

        @Test
        @DisplayName("Should throw UserAlreadyExistsException when username already exists")
        void shouldThrowExceptionWhenUsernameExists() {
            // Arrange
            when(userRepository.existsByUsername(registerRequest.username())).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessage("Username already exists");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw EmailAlreadyExistsException when email already exists")
        void shouldThrowExceptionWhenEmailExists() {
            // Arrange
            when(userRepository.existsByUsername(registerRequest.username())).thenReturn(false);
            when(userRepository.existsByEmail(registerRequest.email())).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessage("Email already exists");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should abort registration and throw GameOperationException if Keycloak connection fails")
        void shouldThrowExceptionWhenKeycloakSyncFails() {
            // Arrange
            when(userRepository.existsByUsername(registerRequest.username())).thenReturn(false);
            when(userRepository.existsByEmail(registerRequest.email())).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(GameOperationException.class)
                .hasMessageContaining("Failed to register user in Keycloak");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("User Login Logic")
    class LoginTests {

        @Test
        @DisplayName("Should throw UsernameNotFoundException when user is not found or inactive")
        void shouldThrowExceptionWhenUserNotFound() {
            // Arrange
            when(userRepository.findByUsernameAndActiveTrue(loginRequest.usernameOrEmail())).thenReturn(Optional.empty());
            when(userRepository.findByEmailAndActiveTrue(loginRequest.usernameOrEmail())).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found or account is deleted");

            verify(authenticationManager, never()).authenticate(any());
        }

        @Test
        @DisplayName("Should resolve user by email when username lookup misses")
        void shouldResolveUserByEmailWhenUsernameMisses() {
            // Arrange
            LoginRequest emailRequest = new LoginRequest("batuhan@chess.com", "Password123");
            when(userRepository.findByUsernameAndActiveTrue("batuhan@chess.com")).thenReturn(Optional.empty());
            when(userRepository.findByEmailAndActiveTrue("batuhan@chess.com")).thenReturn(Optional.of(testUser));
            when(authenticationManager.authenticate(any())).thenReturn(null);

            // Act & Assert
            assertThatThrownBy(() -> authService.login(emailRequest))
                .isInstanceOf(GameOperationException.class)
                .hasMessageContaining("Failed to authenticate session with identity provider");

            verify(authenticationManager).authenticate(any());
        }

        @Test
        @DisplayName("Should throw BadCredentialsException when authentication manager fails credentials verification")
        void shouldThrowExceptionWhenCredentialsAreInvalid() {
            // Arrange
            when(userRepository.findByUsernameAndActiveTrue(loginRequest.usernameOrEmail())).thenReturn(Optional.of(testUser));
            when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

            // Act & Assert
            assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Bad credentials");

            verify(authenticationManager).authenticate(any());
        }

        @Test
        @DisplayName("Should throw GameOperationException if Keycloak token exchange fails during login")
        void shouldThrowExceptionWhenKeycloakTokenEndpointFails() {
            // Arrange
            when(userRepository.findByUsernameAndActiveTrue(loginRequest.usernameOrEmail())).thenReturn(Optional.of(testUser));
            when(authenticationManager.authenticate(any())).thenReturn(null);

            // Act & Assert
            assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(GameOperationException.class)
                .hasMessageContaining("Failed to authenticate session with identity provider");
        }

        @Test
        @DisplayName("Should throw GameOperationException if Keycloak user creation fails during guest login")
        void shouldThrowExceptionWhenGuestKeycloakCreationFails() {
            // Act & Assert
            assertThatThrownBy(() -> authService.loginAsGuest())
                .isInstanceOf(GameOperationException.class)
                .hasMessageContaining("Failed to register user in Keycloak");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Rate Limiting Fallback Handling")
    class RateLimiterFallbackTests {

        @Test
        @DisplayName("Should throw GameOperationException with rate limit message on login fallback")
        void shouldThrowRateLimitExceptionOnLoginFallback() {
            // Arrange
            Throwable cause = new RuntimeException("Rate limit triggered");

            // Act & Assert
            assertThatThrownBy(() -> authService.loginFallback(loginRequest, cause))
                .isInstanceOf(GameOperationException.class)
                .hasMessage("Too many login attempts. Please try again later.");
        }

        @Test
        @DisplayName("Should throw GameOperationException with rate limit message on guest fallback")
        void shouldThrowRateLimitExceptionOnGuestFallback() {
            // Arrange
            Throwable cause = new RuntimeException("Rate limit triggered");

            // Act & Assert
            assertThatThrownBy(() -> authService.guestFallback(cause))
                .isInstanceOf(GameOperationException.class)
                .hasMessage("Too many guest login attempts. Please try again later.");
        }
    }
}
