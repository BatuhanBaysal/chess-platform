package com.batuhan.chess.api.config;

import com.batuhan.chess.api.dto.auth.AuthResponse;
import com.batuhan.chess.api.dto.auth.LoginRequest;
import com.batuhan.chess.application.service.auth.AuthService;
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
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collection;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "ADMIN_USERNAME=admin",
    "ADMIN_EMAIL=admin@chess.com",
    "ADMIN_PASSWORD=Admin123!",
    "spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8081/realms/chess-realm",
    "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:8081/realms/chess-realm/protocol/openid-connect/certs"
})
@DisplayName("Security Configuration Integration Tests")
@Import({SecurityConfig.class})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoleHierarchy roleHierarchy;

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
    @DisplayName("Endpoint Authorization Access & RBAC")
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
            doReturn(mockResponse).when(authService).login(any(LoginRequest.class));

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should permit access to Swagger OpenAPI documentation endpoints")
        void shouldPermitAccessToSwaggerDocumentation() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().is(not(401)))
                .andExpect(status().is(not(403)));
        }

        @Test
        @DisplayName("Should return 401 Unauthorized when accessing /api/users/me without token")
        void shouldDenyUnauthenticatedAccessToUsersMe() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 401 Unauthorized when accessing /api/games without token")
        void shouldDenyUnauthenticatedAccessToGames() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/games/game-123"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should allow USER role to pass authorization check on /api/games endpoint")
        void shouldAllowUserRoleToPassGamesAuthorization() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/games/game-123")
                    .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().is(not(401)))
                .andExpect(status().is(not(403)));
        }

        @Test
        @DisplayName("Should allow GUEST role to pass authorization check on /api/users/me endpoint")
        void shouldAllowGuestRoleToPassUsersMeAuthorization() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/users/me")
                    .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_GUEST"))))
                .andExpect(status().is(not(401)))
                .andExpect(status().is(not(403)));
        }

        @Test
        @DisplayName("Should return 403 Forbidden when GUEST tries to access ADMIN endpoint")
        void shouldDenyGuestFromAccessingAdminEndpoint() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/admin/dashboard")
                    .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_GUEST"))))
                .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Should return 403 Forbidden when USER tries to access ADMIN endpoint")
        void shouldDenyUserFromAccessingAdminEndpoint() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/admin/dashboard")
                    .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Should allow ADMIN role to pass authorization check on ADMIN endpoint")
        void shouldAllowAdminRoleToPassAuthorization() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/admin/dashboard")
                    .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().is(not(403)));
        }

        @Test
        @DisplayName("Should permit anonymous access to Actuator health checks")
        void shouldPermitAccessToActuatorEndpoints() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/actuator/health"))
                .andExpect(status().is(not(401)))
                .andExpect(status().is(not(403)));
        }
    }

    @Nested
    @DisplayName("Role Hierarchy Verification")
    class RoleHierarchyTests {

        @Test
        @DisplayName("Should verify that ADMIN role transitively implies USER and GUEST roles")
        void shouldVerifyRoleHierarchyChain() {
            // Arrange
            List<GrantedAuthority> adminAuthorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));

            // Act
            Collection<? extends GrantedAuthority> reachable = roleHierarchy.getReachableGrantedAuthorities(adminAuthorities);

            // Assert
            assertThat(reachable)
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_ADMIN", "ROLE_USER", "ROLE_GUEST");
        }

        @Test
        @DisplayName("Should verify that USER role implies GUEST role")
        void shouldVerifyUserImpliesGuest() {
            // Arrange
            List<GrantedAuthority> userAuthorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));

            // Act
            Collection<? extends GrantedAuthority> reachable = roleHierarchy.getReachableGrantedAuthorities(userAuthorities);

            // Assert
            assertThat(reachable)
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_USER", "ROLE_GUEST");
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

            // Act & Assert
            mockMvc.perform(options("/api/auth/login")
                    .header("Origin", origin)
                    .header("Access-Control-Request-Method", "POST")
                    .header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", origin))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        }
    }
}
