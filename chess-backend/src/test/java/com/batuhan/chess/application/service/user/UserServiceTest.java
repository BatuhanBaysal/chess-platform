package com.batuhan.chess.application.service.user;

import com.batuhan.chess.api.dto.user.ChangePasswordRequest;
import com.batuhan.chess.api.dto.user.DeleteAccountRequest;
import com.batuhan.chess.api.dto.user.UpdateProfileRequest;
import com.batuhan.chess.api.dto.user.UserResponseDTO;
import com.batuhan.chess.api.exception.EmailAlreadyExistsException;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.api.exception.UserAlreadyExistsException;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private UserService userService;

    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        testUser = UserEntity.builder()
            .username("batuhan")
            .email("test@mail.com")
            .password("encoded_pass")
            .build();

        SecurityContextHolder.setContext(securityContext);
    }

    @Nested
    @DisplayName("Get Profile Tests")
    class GetProfileTests {

        @Test
        @DisplayName("Should return user profile successfully")
        void getProfile_ValidRequest_ReturnsUserResponseDTO() {
            // Arrange
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsername("batuhan")).thenReturn(Optional.of(testUser));

            // Act
            UserResponseDTO result = userService.getProfile();

            // Assert
            assertNotNull(result);
            assertEquals("batuhan", result.username());
            assertEquals("test@mail.com", result.email());
        }

        @Test
        @DisplayName("Should throw RuntimeException when user does not exist")
        void getProfile_UserNotFound_ThrowsException() {
            // Arrange
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("unknown");
            when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> userService.getProfile());
        }
    }

    @Nested
    @DisplayName("Change Password Tests")
    class ChangePasswordTests {

        @Test
        @DisplayName("Should update password when current password is valid")
        void changePassword_ValidRequest_UpdatesPassword() {
            // Arrange
            ChangePasswordRequest request = new ChangePasswordRequest("old_pass", "new_pass123");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsername("batuhan")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("old_pass", "encoded_pass")).thenReturn(true);
            when(passwordEncoder.encode("new_pass123")).thenReturn("new_encoded");

            // Act
            userService.changePassword(request);

            // Assert
            assertEquals("new_encoded", testUser.getPassword());
            verify(userRepository, times(1)).save(testUser);
        }

        @Test
        @DisplayName("Should throw GameOperationException when current password is incorrect")
        void changePassword_InvalidCurrentPassword_ThrowsException() {
            // Arrange
            ChangePasswordRequest request = new ChangePasswordRequest("wrong_pass", "new_pass123");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsername("batuhan")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("wrong_pass", "encoded_pass")).thenReturn(false);

            // Act & Assert
            assertThrows(GameOperationException.class, () -> userService.changePassword(request));
        }
    }

    @Nested
    @DisplayName("Update Profile Tests")
    class UpdateProfileTests {

        @Test
        @DisplayName("Should throw UserAlreadyExistsException when username is taken")
        void updateProfile_DuplicateUsername_ThrowsException() {
            // Arrange
            UpdateProfileRequest request = new UpdateProfileRequest("taken_name", "test@mail.com");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsername("batuhan")).thenReturn(Optional.of(testUser));
            when(userRepository.existsByUsername("taken_name")).thenReturn(true);

            // Act & Assert
            assertThrows(UserAlreadyExistsException.class, () -> userService.updateProfile(request));
        }

        @Test
        @DisplayName("Should throw EmailAlreadyExistsException when email is taken")
        void updateProfile_DuplicateEmail_ThrowsException() {
            // Arrange
            UpdateProfileRequest request = new UpdateProfileRequest("batuhan", "taken@mail.com");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsername("batuhan")).thenReturn(Optional.of(testUser));
            when(userRepository.existsByEmail("taken@mail.com")).thenReturn(true);

            // Act & Assert
            assertThrows(EmailAlreadyExistsException.class, () -> userService.updateProfile(request));
        }

        @Test
        @DisplayName("Should update profile when data is valid")
        void updateProfile_ValidRequest_SavesChanges() {
            // Arrange
            UpdateProfileRequest request = new UpdateProfileRequest("new_name", "new@mail.com");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsername("batuhan")).thenReturn(Optional.of(testUser));
            when(userRepository.existsByUsername("new_name")).thenReturn(false);
            when(userRepository.existsByEmail("new@mail.com")).thenReturn(false);

            // Act
            userService.updateProfile(request);

            // Assert
            assertEquals("new_name", testUser.getUsername());
            assertEquals("new@mail.com", testUser.getEmail());
            verify(userRepository, times(1)).save(testUser);
        }
    }

    @Nested
    @DisplayName("Delete Account Tests")
    class DeleteAccountTests {

        @Test
        @DisplayName("Should delete account when password is valid")
        void deleteAccount_ValidPassword_DeletesAccount() {
            // Arrange
            DeleteAccountRequest request = new DeleteAccountRequest("correct_pass");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsername("batuhan")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("correct_pass", "encoded_pass")).thenReturn(true);

            // Act
            userService.deleteAccount(request);

            // Assert
            verify(userRepository, times(1)).delete(testUser);
        }

        @Test
        @DisplayName("Should throw GameOperationException when password is invalid")
        void deleteAccount_InvalidPassword_ThrowsException() {
            // Arrange
            DeleteAccountRequest request = new DeleteAccountRequest("wrong_pass");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsername("batuhan")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("wrong_pass", "encoded_pass")).thenReturn(false);

            // Act & Assert
            assertThrows(GameOperationException.class, () -> userService.deleteAccount(request));
        }
    }
}
