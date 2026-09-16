package com.batuhan.chess.application.service.user;

import com.batuhan.chess.api.dto.storage.FileDownloadDTO;
import com.batuhan.chess.api.dto.user.*;
import com.batuhan.chess.api.exception.EmailAlreadyExistsException;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.api.exception.UserAlreadyExistsException;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import com.batuhan.chess.domain.repository.FileStoragePort;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.io.InputStream;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Service Business Logic Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private FileStoragePort fileStoragePort;

    @Mock
    private UserSyncService userSyncService;

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
            .id(1L)
            .username("batuhan")
            .email("test@mail.com")
            .password("encoded_pass")
            .eloRating(1200)
            .totalWins(5)
            .totalLosses(2)
            .totalDraws(1)
            .role(UserRole.ROLE_USER)
            .active(true)
            .build();

        SecurityContextHolder.setContext(securityContext);
    }

    @Nested
    @DisplayName("Current User Resolution & Keycloak Sync")
    class CurrentUserResolutionTests {

        @Test
        @DisplayName("Should resolve user via preferred_username claim from JwtAuthenticationToken")
        void shouldResolveUserViaJwtPreferredUsername() {
            // Arrange
            Jwt jwt = createJwt(Map.of("preferred_username", "jwtUser", "sub", "subject-id"));
            JwtAuthenticationToken jwtAuth = new JwtAuthenticationToken(jwt, Collections.emptyList());
            when(securityContext.getAuthentication()).thenReturn(jwtAuth);
            when(userRepository.findByUsernameAndActiveTrue("jwtUser")).thenReturn(Optional.of(testUser));

            // Act
            UserEntity result = userService.getCurrentUserEntity();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getUsername()).isEqualTo("batuhan");
            verify(userSyncService, never()).syncKeycloakUser(any(), any());
        }

        @Test
        @DisplayName("Should fallback to subject claim when preferred_username is absent")
        void shouldFallbackToSubjectWhenPreferredUsernameMissing() {
            // Arrange
            Jwt jwt = createJwt(Map.of("sub", "keycloak-sub-id"));
            JwtAuthenticationToken jwtAuth = new JwtAuthenticationToken(jwt, Collections.emptyList());
            when(securityContext.getAuthentication()).thenReturn(jwtAuth);
            when(userRepository.findByUsernameAndActiveTrue("keycloak-sub-id")).thenReturn(Optional.of(testUser));

            // Act
            UserEntity result = userService.getCurrentUserEntity();

            // Assert
            assertThat(result).isNotNull();
            verify(userRepository).findByUsernameAndActiveTrue("keycloak-sub-id");
        }

        @Test
        @DisplayName("Should trigger userSyncService when user is not found in local database")
        void shouldSyncUserWhenMissingFromLocalDatabase() {
            // Arrange
            Jwt jwt = createJwt(Map.of("preferred_username", "newUser", "sub", "sub-123"));
            JwtAuthenticationToken jwtAuth = new JwtAuthenticationToken(jwt, Collections.emptyList());
            when(securityContext.getAuthentication()).thenReturn(jwtAuth);
            when(userRepository.findByUsernameAndActiveTrue("newUser")).thenReturn(Optional.empty());
            when(userSyncService.syncKeycloakUser(jwt, "newUser")).thenReturn(testUser);

            // Act
            UserEntity result = userService.getCurrentUserEntity();

            // Assert
            assertThat(result).isNotNull();
            verify(userSyncService, times(1)).syncKeycloakUser(jwt, "newUser");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when non-JWT authentication user is missing")
        void shouldThrowExceptionWhenStandardAuthUserNotFound() {
            // Arrange
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("missingUser");
            when(userRepository.findByUsernameAndActiveTrue("missingUser")).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> userService.getCurrentUserEntity())
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with username: missingUser");
        }
    }

    @Nested
    @DisplayName("Get Profile Tests")
    class GetProfileTests {

        @Test
        @DisplayName("Should return user profile successfully")
        void shouldReturnUserProfileSuccessfully() {
            // Arrange
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsernameAndActiveTrue("batuhan")).thenReturn(Optional.of(testUser));

            // Act
            UserResponseDTO result = userService.getProfile();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.username()).isEqualTo("batuhan");
            assertThat(result.email()).isEqualTo("test@mail.com");
            assertThat(result.eloRating()).isEqualTo(1200);
            assertThat(result.role()).isEqualTo(UserRole.ROLE_USER);
        }
    }

    @Nested
    @DisplayName("Leaderboard Tests")
    class LeaderboardTests {

        @Test
        @DisplayName("Should return top 3 users for global leaderboard")
        void shouldReturnTop3Leaderboard() {
            // Arrange
            when(userRepository.findTop3ByOrderByEloRatingDesc(any())).thenReturn(List.of(testUser));

            // Act
            List<UserResponseDTO> leaderboard = userService.getLeaderboard();

            // Assert
            assertThat(leaderboard).hasSize(1);
            assertThat(leaderboard.get(0).username()).isEqualTo("batuhan");
            assertThat(leaderboard.get(0).eloRating()).isEqualTo(1200);
        }

        @Test
        @DisplayName("Should return paginated leaderboard")
        void shouldReturnPagedLeaderboard() {
            // Arrange
            when(userRepository.findAllByActiveTrueOrderByEloRatingDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testUser)));

            // Act
            List<UserResponseDTO> pagedList = userService.getPagedLeaderboard(0, 10);

            // Assert
            assertThat(pagedList).hasSize(1);
            assertThat(pagedList.get(0).username()).isEqualTo("batuhan");
        }
    }

    @Nested
    @DisplayName("Avatar Operations")
    class AvatarTests {

        @Test
        @DisplayName("Should throw IllegalArgumentException when avatar file is null or empty")
        void shouldThrowExceptionWhenAvatarFileEmpty() {
            // Arrange
            MockMultipartFile emptyFile = new MockMultipartFile("file", new byte[0]);

            // Act & Assert
            assertThatThrownBy(() -> userService.uploadAvatar(emptyFile))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Avatar file cannot be empty");

            assertThatThrownBy(() -> userService.uploadAvatar(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Avatar file cannot be empty");
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when file format is unsupported")
        void shouldThrowExceptionWhenFormatUnsupported() {
            // Arrange
            MockMultipartFile invalidFile = new MockMultipartFile(
                "file", "test.txt", MediaType.TEXT_PLAIN_VALUE, "plain-text-data".getBytes()
            );

            // Act & Assert
            assertThatThrownBy(() -> userService.uploadAvatar(invalidFile))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only PNG and JPEG formats are supported");
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when file size exceeds 2MB")
        void shouldThrowExceptionWhenSizeExceedsLimit() {
            // Arrange
            byte[] oversized = new byte[2 * 1024 * 1024 + 1];
            MockMultipartFile largeFile = new MockMultipartFile(
                "file", "large.png", MediaType.IMAGE_PNG_VALUE, oversized
            );

            // Act & Assert
            assertThatThrownBy(() -> userService.uploadAvatar(largeFile))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Avatar size must not exceed 2MB");
        }

        @Test
        @DisplayName("Should upload avatar successfully when file is valid PNG")
        void shouldUploadValidAvatarSuccessfully() {
            // Arrange
            MockMultipartFile validFile = new MockMultipartFile(
                "file", "avatar.png", MediaType.IMAGE_PNG_VALUE, "valid-image-bytes".getBytes()
            );
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");

            // Act
            AvatarUploadResponse response = userService.uploadAvatar(validFile);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.avatarUrl()).isEqualTo("/api/users/batuhan/avatar");
            verify(fileStoragePort).uploadFile(eq("avatars/batuhan.png"), any(InputStream.class), eq(validFile.getSize()), eq(MediaType.IMAGE_PNG_VALUE));
        }

        @Test
        @DisplayName("Should return avatar file when existing file is queried")
        void shouldReturnAvatarWhenFileExists() {
            // Arrange
            byte[] content = "image-binary-payload".getBytes();
            when(fileStoragePort.doesFileExist("avatars/batuhan.png")).thenReturn(true);
            when(fileStoragePort.downloadFile("avatars/batuhan.png")).thenReturn(content);

            // Act
            FileDownloadDTO download = userService.getAvatar("batuhan");

            // Assert
            assertThat(download).isNotNull();
            assertThat(download.data()).isEqualTo(content);
            assertThat(download.contentType()).isEqualTo(MediaType.IMAGE_PNG_VALUE);
            assertThat(download.fileName()).isEqualTo("batuhan.png");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when avatar does not exist")
        void shouldThrowExceptionWhenAvatarNotFound() {
            // Arrange
            when(fileStoragePort.doesFileExist("avatars/unknown.png")).thenReturn(false);
            when(fileStoragePort.doesFileExist("avatars/unknown.jpg")).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> userService.getAvatar("unknown"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Avatar not found for user: unknown");
        }
    }

    @Nested
    @DisplayName("Change Password Tests")
    class ChangePasswordTests {

        @Test
        @DisplayName("Should update password when current password matches")
        void shouldUpdatePasswordWhenCurrentPasswordValid() {
            // Arrange
            ChangePasswordRequest request = new ChangePasswordRequest("old_pass", "new_pass123");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsernameAndActiveTrue("batuhan")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("old_pass", "encoded_pass")).thenReturn(true);
            when(passwordEncoder.encode("new_pass123")).thenReturn("new_encoded");

            // Act
            userService.changePassword(request);

            // Assert
            assertThat(testUser.getPassword()).isEqualTo("new_encoded");
            verify(userRepository, times(1)).save(testUser);
        }

        @Test
        @DisplayName("Should throw GameOperationException when current password does not match")
        void shouldThrowExceptionWhenCurrentPasswordMismatch() {
            // Arrange
            ChangePasswordRequest request = new ChangePasswordRequest("wrong_pass", "new_pass123");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsernameAndActiveTrue("batuhan")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("wrong_pass", "encoded_pass")).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> userService.changePassword(request))
                .isInstanceOf(GameOperationException.class)
                .hasMessage("Current password does not match");
        }
    }

    @Nested
    @DisplayName("Update Profile Tests")
    class UpdateProfileTests {

        @Test
        @DisplayName("Should throw UserAlreadyExistsException when new username is already in use")
        void shouldThrowExceptionWhenUsernameAlreadyTaken() {
            // Arrange
            UpdateProfileRequest request = new UpdateProfileRequest("taken_name", "test@mail.com");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsernameAndActiveTrue("batuhan")).thenReturn(Optional.of(testUser));
            when(userRepository.existsByUsername("taken_name")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> userService.updateProfile(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessage("Username 'taken_name' is already taken.");
        }

        @Test
        @DisplayName("Should throw EmailAlreadyExistsException when new email is already in use")
        void shouldThrowExceptionWhenEmailAlreadyTaken() {
            // Arrange
            UpdateProfileRequest request = new UpdateProfileRequest("batuhan", "taken@mail.com");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsernameAndActiveTrue("batuhan")).thenReturn(Optional.of(testUser));
            when(userRepository.existsByEmail("taken@mail.com")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> userService.updateProfile(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessage("Email 'taken@mail.com' is already in use.");
        }

        @Test
        @DisplayName("Should update profile when new data is unique")
        void shouldUpdateProfileWhenDataValid() {
            // Arrange
            UpdateProfileRequest request = new UpdateProfileRequest("new_name", "new@mail.com");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsernameAndActiveTrue("batuhan")).thenReturn(Optional.of(testUser));
            when(userRepository.existsByUsername("new_name")).thenReturn(false);
            when(userRepository.existsByEmail("new@mail.com")).thenReturn(false);

            // Act
            userService.updateProfile(request);

            // Assert
            assertThat(testUser.getUsername()).isEqualTo("new_name");
            assertThat(testUser.getEmail()).isEqualTo("new@mail.com");
            verify(userRepository, times(1)).save(testUser);
        }
    }

    @Nested
    @DisplayName("Delete Account Tests")
    class DeleteAccountTests {

        @Test
        @DisplayName("Should soft delete account when password verification succeeds")
        void shouldSoftDeleteAccountWhenPasswordMatches() {
            // Arrange
            DeleteAccountRequest request = new DeleteAccountRequest("correct_pass");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsernameAndActiveTrue("batuhan")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("correct_pass", "encoded_pass")).thenReturn(true);

            // Act
            userService.deleteAccount(request);

            // Assert
            assertThat(testUser.isActive()).isFalse();
            verify(userRepository, times(1)).save(testUser);
            verify(userRepository, never()).delete(any(UserEntity.class));
        }

        @Test
        @DisplayName("Should throw GameOperationException when password verification fails")
        void shouldThrowExceptionWhenDeletePasswordMismatch() {
            // Arrange
            DeleteAccountRequest request = new DeleteAccountRequest("wrong_pass");
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");
            when(userRepository.findByUsernameAndActiveTrue("batuhan")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("wrong_pass", "encoded_pass")).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> userService.deleteAccount(request))
                .isInstanceOf(GameOperationException.class)
                .hasMessage("Password verification failed while trying to delete the account.");
        }
    }

    private Jwt createJwt(Map<String, Object> claims) {
        return new Jwt(
            "token-val",
            Instant.now(),
            Instant.now().plusSeconds(300),
            Map.of("alg", "none"),
            claims
        );
    }
}
