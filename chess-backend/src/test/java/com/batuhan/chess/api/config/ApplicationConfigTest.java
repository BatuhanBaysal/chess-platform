package com.batuhan.chess.api.config;

import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Technical test suite for ApplicationConfig.
 * Validates the correct creation of security-related beans and the logic
 * of the custom UserDetailsService implementation.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Application Configuration Functional Tests")
class ApplicationConfigTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ApplicationConfig applicationConfig;

    @Nested
    @DisplayName("UserDetailsService Implementation")
    class UserDetailsServiceTests {

        @Test
        @DisplayName("Should return valid UserDetails when user exists in database")
        void shouldLoadUserDetailsSuccessfullyWhenUserExists() {
            // Arrange
            String username = "testUser";
            UserEntity userEntity = UserEntity.builder()
                .username(username)
                .password("secret")
                .role(UserRole.ROLE_USER)
                .build();

            when(userRepository.findByUsername(username)).thenReturn(Optional.of(userEntity));
            UserDetailsService userDetailsService = applicationConfig.userDetailsService();

            // Act
            UserDetails result = userDetailsService.loadUserByUsername(username);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getUsername()).isEqualTo(username);
            assertThat(result.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
            verify(userRepository).findByUsername(username);
        }

        @Test
        @DisplayName("Should throw UsernameNotFoundException when user is missing from repository")
        void shouldThrowExceptionWhenUserIsNotFound() {
            // Arrange
            String username = "unknownUser";
            when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
            UserDetailsService userDetailsService = applicationConfig.userDetailsService();

            // Act & Assert
            assertThrows(UsernameNotFoundException.class, () ->
                userDetailsService.loadUserByUsername(username)
            );
            verify(userRepository).findByUsername(username);
        }
    }

    @Nested
    @DisplayName("Security Bean Definitions")
    class BeanCreationTests {

        @Test
        @DisplayName("Should initialize a BCryptPasswordEncoder bean")
        void shouldCreatePasswordEncoderBean() {
            // Act
            PasswordEncoder encoder = applicationConfig.passwordEncoder();

            // Assert
            assertThat(encoder).isNotNull();
        }

        @Test
        @DisplayName("Should initialize a DaoAuthenticationProvider with correct dependencies")
        void shouldCreateAuthenticationProviderBean() {
            // Act
            AuthenticationProvider provider = applicationConfig.authenticationProvider();

            // Assert
            assertThat(provider)
                .isNotNull()
                .isInstanceOf(DaoAuthenticationProvider.class);
        }
    }
}
