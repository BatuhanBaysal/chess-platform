package com.batuhan.chess.application.service.auth;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Technical test suite for JwtService.
 * Validates JWT generation, claims extraction, and token expiration logic
 * using manual key simulation via ReflectionTestUtils.
 */
@DisplayName("JWT Service Technical Tests")
class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails testUserDetails;

    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long EXPIRATION = 3600000;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", EXPIRATION);

        testUserDetails = User.builder()
            .username("testUser")
            .password("password")
            .authorities(Collections.emptyList())
            .build();
    }

    @Nested
    @DisplayName("Token Generation and Extraction")
    class TokenGenerationTests {

        @Test
        @DisplayName("Should generate a valid three-part JWT when user details are provided")
        void shouldGenerateValidJwtToken() {
            // Act
            String token = jwtService.generateToken(testUserDetails);

            // Assert
            assertThat(token)
                .isNotBlank()
                .contains(".")
                .matches(t -> t.split("\\.").length == 3);
        }

        @Test
        @DisplayName("Should extract the correct subject (username) from a generated token")
        void shouldExtractUsernameCorrectly() {
            // Arrange
            String token = jwtService.generateToken(testUserDetails);

            // Act
            String extractedUsername = jwtService.extractUsername(token);

            // Assert
            assertThat(extractedUsername)
                .isEqualTo(testUserDetails.getUsername());
        }
    }

    @Nested
    @DisplayName("Token Validation and Security")
    class TokenValidationTests {

        @Test
        @DisplayName("Should return true when token is unexpired and matches user details")
        void shouldValidateCorrectTokenSuccessfully() {
            // Arrange
            String token = jwtService.generateToken(testUserDetails);

            // Act
            boolean isValid = jwtService.isTokenValid(token, testUserDetails);

            // Assert
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should return false if the token subject does not match the provided user")
        void shouldReturnFalseOnUsernameMismatch() {
            // Arrange
            String token = jwtService.generateToken(testUserDetails);
            UserDetails differentUser = User.builder()
                .username("otherUser")
                .password("password")
                .authorities(Collections.emptyList())
                .build();

            // Act
            boolean isValid = jwtService.isTokenValid(token, differentUser);

            // Assert
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should throw ExpiredJwtException when attempting to validate an outdated token")
        void shouldThrowExceptionForExpiredToken() {
            // Arrange
            String expiredToken = Jwts.builder()
                .subject(testUserDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis() - 20000))
                .expiration(new Date(System.currentTimeMillis() - 10000))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .compact();

            // Act & Assert
            assertThatThrownBy(() -> jwtService.isTokenValid(expiredToken, testUserDetails))
                .isInstanceOf(ExpiredJwtException.class);
        }
    }
}
