package com.batuhan.chess.api.config;

import com.batuhan.chess.application.service.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Security test suite for JwtAuthenticationFilter.
 * Validates JWT extraction, user authentication process, and filter chain delegation
 * across various request scenarios including security context management.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("JWT Authentication Filter Technical Tests")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    @DisplayName("Filter Bypass Logic")
    class FilterBypassTests {

        @Test
        @DisplayName("Should skip filtering and logic when path starts with /actuator")
        void shouldSkipFilteringWhenPathIsActuator() throws ServletException, IOException {
            // Arrange
            when(request.getServletPath()).thenReturn("/actuator/health");

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            verify(filterChain).doFilter(request, response);
            verifyNoInteractions(jwtService, userDetailsService);
        }

        @Test
        @DisplayName("Should skip authentication when Authorization header is missing")
        void shouldSkipAuthenticationWhenHeaderIsMissing() throws ServletException, IOException {
            // Arrange
            when(request.getServletPath()).thenReturn("/api/data");
            when(request.getHeader("Authorization")).thenReturn(null);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should skip authentication when header prefix is not Bearer")
        void shouldSkipAuthenticationWhenHeaderIsNotBearer() throws ServletException, IOException {
            // Arrange
            when(request.getServletPath()).thenReturn("/api/games");
            when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
            verifyNoInteractions(jwtService);
        }
    }

    @Nested
    @DisplayName("Token Validation and Authentication")
    class AuthenticationTests {

        @Test
        @DisplayName("Should set authentication in context when valid token is provided")
        void shouldAuthenticateUserWhenTokenIsValid() throws ServletException, IOException {
            // Arrange
            String token = "valid.jwt.token";
            String username = "batuhan";
            UserDetails userDetails = mock(UserDetails.class);

            when(request.getServletPath()).thenReturn("/api/chess/move");
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtService.extractUsername(token)).thenReturn(username);
            when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
            when(jwtService.isTokenValid(token, userDetails)).thenReturn(true);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should not set authentication when token is invalid")
        void shouldNotAuthenticateWhenTokenIsInvalid() throws ServletException, IOException {
            // Arrange
            String token = "invalid.token";
            String username = "batuhan";
            UserDetails userDetails = mock(UserDetails.class);

            when(request.getServletPath()).thenReturn("/api/chess/move");
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtService.extractUsername(token)).thenReturn(username);
            when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
            when(jwtService.isTokenValid(token, userDetails)).thenReturn(false);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should skip authentication if a principal is already present in security context")
        void shouldSkipIfAlreadyAuthenticated() throws ServletException, IOException {
            // Arrange
            String token = "valid.token";
            String username = "batuhan";
            var existingAuth = new UsernamePasswordAuthenticationToken("existing", null, null);
            SecurityContextHolder.getContext().setAuthentication(existingAuth);

            when(request.getServletPath()).thenReturn("/api/games");
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtService.extractUsername(token)).thenReturn(username);

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isEqualTo(existingAuth);
            verifyNoInteractions(userDetailsService);
            verify(filterChain).doFilter(request, response);
        }
    }

    @Nested
    @DisplayName("Exception Handling and Coverage")
    class TechnicalTests {

        @Test
        @DisplayName("Should continue filter chain even if an exception occurs during processing")
        void shouldContinueChainOnException() throws ServletException, IOException {
            // Arrange
            when(request.getServletPath()).thenReturn("/api/secure");
            when(request.getHeader("Authorization")).thenReturn("Bearer error-token");
            when(jwtService.extractUsername(anyString())).thenThrow(new RuntimeException("JWT Parsing Error"));

            // Act
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Assert
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("shouldNotFilter: Should return true for actuator paths and false for others")
        void shouldNotFilterVerification() {
            // Arrange
            when(request.getServletPath()).thenReturn("/actuator/info");
            boolean actuatorResult = jwtAuthenticationFilter.shouldNotFilter(request);

            when(request.getServletPath()).thenReturn("/api/move");
            boolean regularResult = jwtAuthenticationFilter.shouldNotFilter(request);

            // Assert
            assertThat(actuatorResult).isTrue();
            assertThat(regularResult).isFalse();
        }
    }
}
