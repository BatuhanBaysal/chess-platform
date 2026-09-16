package com.batuhan.chess.api.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Keycloak Role Converter Unit Tests")
class KeycloakRoleConverterTest {

    private KeycloakRoleConverter converter;

    @BeforeEach
    void setUp() {
        converter = new KeycloakRoleConverter();
    }

    @Nested
    @DisplayName("Role Conversion Logic")
    class RoleConversionTests {

        @Test
        @DisplayName("Should extract roles and prepend ROLE_ prefix when prefix is missing")
        void shouldPrependRolePrefixWhenMissing() {
            // Arrange
            Jwt jwt = createJwtWithClaims(Map.of(
                "realm_access", Map.of("roles", List.of("USER", "GUEST"))
            ));

            // Act
            Collection<GrantedAuthority> authorities = converter.convert(jwt);

            // Assert
            assertThat(authorities)
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_USER", "ROLE_GUEST");
        }

        @Test
        @DisplayName("Should not duplicate ROLE_ prefix if it already exists")
        void shouldNotDuplicateRolePrefixIfAlreadyPresent() {
            // Arrange
            Jwt jwt = createJwtWithClaims(Map.of(
                "realm_access", Map.of("roles", List.of("ROLE_ADMIN", "USER"))
            ));

            // Act
            Collection<GrantedAuthority> authorities = converter.convert(jwt);

            // Assert
            assertThat(authorities)
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_ADMIN", "ROLE_USER");
        }
    }

    @Nested
    @DisplayName("Edge Case and Null Handling")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should return empty list when realm_access claim is absent")
        void shouldReturnEmptyWhenRealmAccessMissing() {
            // Arrange
            Jwt jwt = createJwtWithClaims(Map.of("sub", "user-without-realm-access"));

            // Act
            Collection<GrantedAuthority> authorities = converter.convert(jwt);

            // Assert
            assertThat(authorities).isEmpty();
        }

        @Test
        @DisplayName("Should return empty list when realm_access map is empty")
        void shouldReturnEmptyWhenRealmAccessIsEmptyMap() {
            // Arrange
            Jwt jwt = createJwtWithClaims(Map.of("realm_access", Collections.emptyMap()));

            // Act
            Collection<GrantedAuthority> authorities = converter.convert(jwt);

            // Assert
            assertThat(authorities).isEmpty();
        }

        @Test
        @DisplayName("Should return empty list when roles list is absent or empty")
        void shouldReturnEmptyWhenRolesKeyMissingOrEmpty() {
            // Arrange
            Jwt jwtWithNullRoles = createJwtWithClaims(Map.of("realm_access", Collections.singletonMap("roles", null)));
            Jwt jwtWithEmptyRoles = createJwtWithClaims(Map.of("realm_access", Map.of("roles", Collections.emptyList())));

            // Act
            Collection<GrantedAuthority> nullRolesResult = converter.convert(jwtWithNullRoles);
            Collection<GrantedAuthority> emptyRolesResult = converter.convert(jwtWithEmptyRoles);

            // Assert
            assertThat(nullRolesResult).isEmpty();
            assertThat(emptyRolesResult).isEmpty();
        }
    }

    private Jwt createJwtWithClaims(Map<String, Object> claims) {
        return new Jwt(
            "token-value",
            Instant.now(),
            Instant.now().plusSeconds(300),
            Map.of("alg", "none"),
            claims
        );
    }
}
