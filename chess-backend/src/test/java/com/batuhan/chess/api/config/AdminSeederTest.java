package com.batuhan.chess.api.config;

import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminSeeder Unit Tests")
class AdminSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminSeeder adminSeeder;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminSeeder, "adminUsername", "admin");
        ReflectionTestUtils.setField(adminSeeder, "adminEmail", "admin@chess.com");
        ReflectionTestUtils.setField(adminSeeder, "adminPassword", "Admin123!");
    }

    @Test
    @DisplayName("Should create and save default admin when admin user does not exist")
    void shouldCreateAdminWhenNotExists() throws Exception {
        // Arrange
        when(userRepository.findByUsernameAndActiveTrue("admin")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Admin123!")).thenReturn("encodedPassword123");

        CommandLineRunner runner = adminSeeder.initAdmin(userRepository, passwordEncoder);

        // Act
        runner.run();

        // Assert
        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository, times(1)).save(captor.capture());

        UserEntity savedUser = captor.getValue();
        assertThat(savedUser.getUsername()).isEqualTo("admin");
        assertThat(savedUser.getEmail()).isEqualTo("admin@chess.com");
        assertThat(savedUser.getPassword()).isEqualTo("encodedPassword123");
        assertThat(savedUser.getRole()).isEqualTo(UserRole.ROLE_ADMIN);
        assertThat(savedUser.isActive()).isTrue();
        assertThat(savedUser.isGuest()).isFalse();
    }

    @Test
    @DisplayName("Should not create admin when admin user already exists in database")
    void shouldNotCreateAdminWhenAlreadyExists() throws Exception {
        // Arrange
        UserEntity existingAdmin = UserEntity.builder()
            .username("admin")
            .email("admin@chess.com")
            .build();
        when(userRepository.findByUsernameAndActiveTrue("admin")).thenReturn(Optional.of(existingAdmin));

        CommandLineRunner runner = adminSeeder.initAdmin(userRepository, passwordEncoder);

        // Act
        runner.run();

        // Assert
        verify(userRepository, never()).save(any(UserEntity.class));
    }
}
