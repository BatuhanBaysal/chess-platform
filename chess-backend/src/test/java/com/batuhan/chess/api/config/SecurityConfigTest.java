package com.batuhan.chess.api.config;

import com.batuhan.chess.application.service.auth.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test suite for Security Configuration.
 * Validates HTTP security filter chain, CORS policies, and endpoint authorization
 * levels within a full Spring Boot application context.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Security Configuration Integration Tests")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    @Nested
    @DisplayName("Endpoint Authorization Access")
    class AuthorizationTests {

        @Test
        @DisplayName("Should permit access to public authentication endpoints")
        void shouldPermitAccessToPublicAuthEndpoints() throws Exception {
            // Arrange
            String loginUrl = "/api/auth/login";

            // Act & Assert
            mockMvc.perform(post(loginUrl))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should deny access to protected endpoints without authentication")
        void shouldDenyUnauthenticatedAccessToProtectedResource() throws Exception {
            // Arrange
            String protectedUrl = "/api/v1/secure/resource";

            // Act & Assert
            mockMvc.perform(get(protectedUrl))
                .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Should allow anonymous access to Actuator health checks")
        void shouldPermitAccessToActuatorEndpoints() throws Exception {
            // Arrange
            String healthUrl = "/actuator/health";

            // Act & Assert
            mockMvc.perform(get(healthUrl))
                .andExpect(status().isOk());
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
            String loginUrl = "/api/auth/login";

            // Act & Assert
            mockMvc.perform(options(loginUrl)
                    .header("Origin", origin)
                    .header("Access-Control-Request-Method", "POST")
                    .header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", origin))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        }
    }
}
