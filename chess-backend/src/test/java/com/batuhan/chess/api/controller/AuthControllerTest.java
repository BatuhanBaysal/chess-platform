package com.batuhan.chess.api.controller;

import com.batuhan.chess.AbstractIntegrationTest;
import com.batuhan.chess.api.dto.auth.AuthResponse;
import com.batuhan.chess.api.dto.auth.LoginRequest;
import com.batuhan.chess.api.dto.auth.RegisterRequest;
import com.batuhan.chess.application.service.auth.AuthService;
import com.batuhan.chess.domain.model.user.UserRole;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.head;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Authentication Controller Web Layer & Rate Limiting Tests")
class AuthControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RateLimiterRegistry rateLimiterRegistry;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private RedissonClient redissonClient;

    @MockitoBean
    private RedisConnectionFactory redisConnectionFactory;

    @MockitoBean
    private RedisTemplate<String, Object> redisTemplate;

    @BeforeEach
    void setUp() {
        // Arrange
        rateLimiterRegistry.getAllRateLimiters().forEach(limiter -> {
            String name = limiter.getName();
            var config = limiter.getRateLimiterConfig();
            rateLimiterRegistry.remove(name);
            rateLimiterRegistry.rateLimiter(name, config);
        });
    }

    @Nested
    @DisplayName("User Registration")
    class RegistrationTests {

        @Test
        @DisplayName("Should return 200 OK and success message when registration is valid")
        void shouldRegisterUserSuccessfully() throws Exception {
            // Arrange
            RegisterRequest request = new RegisterRequest("batuhan", "batuhan@chess.com", "Password123");
            doNothing().when(authService).register(any(RegisterRequest.class));

            // Act
            ResultActions result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(content().string("User registered successfully"));

            verify(authService).register(any(RegisterRequest.class));
        }

        @Test
        @DisplayName("Should return 429 Too Many Requests when registration rate limit is breached")
        void shouldReturn429WhenRegistrationRateLimitExceeded() throws Exception {
            // Arrange
            RegisterRequest request = new RegisterRequest("spamuser", "spam@chess.com", "Password123");
            doNothing().when(authService).register(any(RegisterRequest.class));
            String payload = objectMapper.writeValueAsString(request);

            // Act & Assert
            for (int i = 0; i < 3; i++) {
                mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                    .andExpect(status().isOk());
            }

            // Act
            ResultActions rateLimitedResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload));

            // Assert
            rateLimitedResult.andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value("Too many requests. Please wait a moment."));
        }
    }

    @Nested
    @DisplayName("User Login Operations")
    class LoginTests {

        @Test
        @DisplayName("Should return JWT token and username upon successful login")
        void shouldLoginSuccessfully() throws Exception {
            // Arrange
            LoginRequest request = new LoginRequest("batuhan", "Password123");
            AuthResponse response = AuthResponse.builder()
                .token("mock-jwt-token")
                .username("batuhan")
                .build();

            when(authService.login(any(LoginRequest.class))).thenReturn(response);

            // Act
            ResultActions result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.username").value("batuhan"));

            verify(authService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should return guest token when logging in as a guest")
        void shouldLoginAsGuestSuccessfully() throws Exception {
            // Arrange
            AuthResponse response = AuthResponse.builder()
                .token("guest-token")
                .role(UserRole.ROLE_GUEST)
                .build();

            when(authService.loginAsGuest()).thenReturn(response);

            // Act
            ResultActions result = mockMvc.perform(post("/api/auth/guest"));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("guest-token"))
                .andExpect(jsonPath("$.role").value("ROLE_GUEST"));

            verify(authService).loginAsGuest();
        }
    }

    @Nested
    @DisplayName("Health Check Operations")
    class HealthCheckTests {

        @Test
        @DisplayName("Should return 200 OK for GET request on health endpoint")
        void shouldReturnOkForHealthGet() throws Exception {
            // Arrange
            String healthEndpoint = "/api/auth/health";

            // Act
            ResultActions result = mockMvc.perform(get(healthEndpoint));

            // Assert
            result.andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return 200 OK for HEAD request on health endpoint")
        void shouldReturnOkForHealthHead() throws Exception {
            // Arrange
            String healthEndpoint = "/api/auth/health";

            // Act
            ResultActions result = mockMvc.perform(head(healthEndpoint));

            // Assert
            result.andExpect(status().isOk());
        }
    }
}
