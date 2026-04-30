package com.batuhan.chess.application.service.auth;

import com.batuhan.chess.api.dto.auth.AuthResponse;
import com.batuhan.chess.api.dto.auth.LoginRequest;
import com.batuhan.chess.api.dto.auth.RegisterRequest;
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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit test suite for AuthService.
 * Validates authentication and registration business logic, including
 * user persistence, password encoding, and JWT generation processes.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Authentication Service Business Logic Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

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
            .isGuest(false)
            .eloRating(1200)
            .build();
    }

    @Nested
    @DisplayName("User Registration Logic")
    class RegistrationTests {

        @Test
        @DisplayName("Should encode password and save user when credentials are unique")
        void shouldRegisterUserSuccessfully() {
            // Arrange
            when(userRepository.existsByUsername(registerRequest.username())).thenReturn(false);
            when(userRepository.existsByEmail(registerRequest.email())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

            // Act
            authService.register(registerRequest);

            // Assert
            verify(userRepository).save(any(UserEntity.class));
            verify(passwordEncoder).encode(registerRequest.password());
        }

        @Test
        @DisplayName("Should throw RuntimeException when the chosen username is already taken")
        void shouldThrowExceptionWhenUsernameExists() {
            // Arrange
            when(userRepository.existsByUsername(registerRequest.username())).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Username already exists");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw RuntimeException when the provided email is already registered")
        void shouldThrowExceptionWhenEmailExists() {
            // Arrange
            when(userRepository.existsByUsername(registerRequest.username())).thenReturn(false);
            when(userRepository.existsByEmail(registerRequest.email())).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already exists");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("User Login Logic")
    class LoginTests {

        @Test
        @DisplayName("Should return AuthResponse with token when login credentials are valid")
        void shouldReturnAuthResponseOnValidLogin() {
            // Arrange
            when(userRepository.findByUsername(loginRequest.username())).thenReturn(Optional.of(testUser));
            when(jwtService.generateToken(any(UserDetails.class))).thenReturn("mock-jwt-token");

            // Act
            AuthResponse response = authService.login(loginRequest);

            // Assert
            assertThat(response)
                .isNotNull()
                .satisfies(res -> {
                    assertThat(res.token()).isEqualTo("mock-jwt-token");
                    assertThat(res.username()).isEqualTo("batuhan");
                });

            verify(authenticationManager).authenticate(any());
        }

        @Test
        @DisplayName("Should throw exception and abort token generation if user does not exist")
        void shouldThrowExceptionWhenUserNotFound() {
            // Arrange
            when(userRepository.findByUsername(loginRequest.username())).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found: " + loginRequest.username());

            verify(jwtService, never()).generateToken(any());
        }

        @Test
        @DisplayName("Should create a temporary guest user and return a guest JWT")
        void shouldHandleGuestLoginSuccessfully() {
            // Arrange
            when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);
            when(jwtService.generateToken(any())).thenReturn("guest-jwt-token");
            when(passwordEncoder.encode(anyString())).thenReturn("encodedRandomPassword");

            // Act
            AuthResponse response = authService.loginAsGuest();

            // Assert
            assertThat(response)
                .isNotNull()
                .extracting(AuthResponse::token)
                .isEqualTo("guest-jwt-token");

            verify(userRepository).save(any(UserEntity.class));
        }
    }
}
