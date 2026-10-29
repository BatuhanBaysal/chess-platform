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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Application Configuration Functional Tests")
class ApplicationConfigTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationConfiguration authenticationConfiguration;

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

            when(userRepository.findByUsernameAndActiveTrue(username)).thenReturn(Optional.of(userEntity));
            UserDetailsService userDetailsService = applicationConfig.userDetailsService();

            // Act
            UserDetails result = userDetailsService.loadUserByUsername(username);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getUsername()).isEqualTo(username);
            assertThat(result.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
            verify(userRepository).findByUsernameAndActiveTrue(username);
        }

        @Test
        @DisplayName("Should throw UsernameNotFoundException when user is missing from repository")
        void shouldThrowExceptionWhenUserIsNotFound() {
            // Arrange
            String username = "unknownUser";
            when(userRepository.findByUsernameAndActiveTrue(username)).thenReturn(Optional.empty());
            UserDetailsService userDetailsService = applicationConfig.userDetailsService();

            // Act & Assert
            assertThatThrownBy(() -> userDetailsService.loadUserByUsername(username))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found or account is deactivated: " + username);

            verify(userRepository).findByUsernameAndActiveTrue(username);
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

        @Test
        @DisplayName("Should delegate and return AuthenticationManager from AuthenticationConfiguration")
        void shouldCreateAuthenticationManagerBean() throws Exception {
            // Arrange
            AuthenticationManager mockManager = mock(AuthenticationManager.class);
            when(authenticationConfiguration.getAuthenticationManager()).thenReturn(mockManager);

            // Act
            AuthenticationManager manager = applicationConfig.authenticationManager(authenticationConfiguration);

            // Assert
            assertThat(manager).isEqualTo(mockManager);
            verify(authenticationConfiguration, times(1)).getAuthenticationManager();
        }
    }
}
