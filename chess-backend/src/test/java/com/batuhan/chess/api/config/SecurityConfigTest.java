package com.batuhan.chess.api.config;

import com.batuhan.chess.api.dto.auth.AuthResponse;
import com.batuhan.chess.api.dto.auth.LoginRequest;
import com.batuhan.chess.application.service.auth.AuthService;
import com.batuhan.chess.application.service.auth.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test suite for SecurityConfig.
 * Validates endpoint authorization rules, CORS configurations,
 * and public access permissions using MockMvc.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Security Configuration Integration Tests")
@Import({SecurityConfig.class})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    @MockitoBean
    private RedissonClient redissonClient;

    @MockitoBean
    private RedisConnectionFactory redisConnectionFactory;

    @MockitoBean
    private RedisTemplate<String, Object> redisTemplate;

    @MockitoBean
    private AuthService authService;

    @Nested
    @DisplayName("Endpoint Authorization Access")
    class AuthorizationTests {

        @Test
        @DisplayName("Should permit access to public authentication endpoints")
        void shouldPermitAccessToPublicAuthEndpoints() throws Exception {
            // Arrange
            LoginRequest loginRequest = new LoginRequest("testuser", "password123");
            AuthResponse mockResponse = AuthResponse.builder()
                .token("mock-token")
                .username("testuser")
                .build();

            doReturn(mockResponse)
                .when(authService).login(any(LoginRequest.class));

            // Act
            var result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)));

            // Assert
            result.andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should deny access to protected endpoints without authentication")
        void shouldDenyUnauthenticatedAccessToProtectedResource() throws Exception {
            // Act
            var result = mockMvc.perform(get("/api/v1/secure/resource"));

            // Assert
            result.andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Should allow anonymous access to Actuator health checks")
        void shouldPermitAccessToActuatorEndpoints() throws Exception {
            // Act
            var result = mockMvc.perform(get("/actuator/health"));

            // Assert
            result.andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Cross-Origin Resource Sharing (CORS)")
    class CorsTests {

        @Test
        @DisplayName("Should handle preflight requests with correct headers")
        void shouldHandleCorsConfigurationForPreflight() throws Exception {
            // Arrange
            String origin = "http://localhost:5173";

            // Act
            var result = mockMvc.perform(options("/api/auth/login")
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Authorization"));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", origin))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        }
    }
}
