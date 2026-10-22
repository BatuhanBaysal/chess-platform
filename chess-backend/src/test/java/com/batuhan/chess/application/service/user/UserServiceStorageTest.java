package com.batuhan.chess.application.service.user;

import com.batuhan.chess.api.dto.storage.FileDownloadDTO;
import com.batuhan.chess.api.dto.user.AvatarUploadResponse;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import com.batuhan.chess.domain.repository.FileStoragePort;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.admin.client.Keycloak;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UserServiceStorageTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private FileStoragePort fileStoragePort;

    @Mock
    private UserSyncService userSyncService;

    @Mock
    private Keycloak keycloak;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private UserService userService;

    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);

        testUser = UserEntity.builder()
            .id(1L)
            .externalId(UUID.randomUUID())
            .username("batuhan")
            .email("test@mail.com")
            .eloRating(1200)
            .role(UserRole.ROLE_USER)
            .active(true)
            .build();

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("batuhan");
        when(userRepository.findByUsernameAndActiveTrue("batuhan")).thenReturn(Optional.of(testUser));
    }

    @Nested
    @DisplayName("Avatar Upload Tests")
    class UploadAvatarTests {

        @Test
        @DisplayName("Should successfully upload PNG avatar and return response")
        void uploadAvatar_ValidPngFile_UploadsAndReturnsResponse() {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", MediaType.IMAGE_PNG_VALUE, "dummy image content".getBytes()
            );

            when(fileStoragePort.uploadFile(
                eq("avatars/batuhan.png"),
                any(InputStream.class),
                eq(file.getSize()),
                eq(MediaType.IMAGE_PNG_VALUE)
            )).thenReturn("avatars/batuhan.png");

            // Act
            AvatarUploadResponse response = userService.uploadAvatar(file);

            // Assert
            assertNotNull(response);
            assertEquals("/api/users/batuhan/avatar", response.avatarUrl());
            assertEquals("Avatar uploaded successfully", response.message());
            assertEquals("/api/users/batuhan/avatar", testUser.getAvatarUrl());

            verify(userRepository, times(1)).save(testUser);
            verify(fileStoragePort, times(1)).uploadFile(eq("avatars/batuhan.png"), any(InputStream.class), eq(file.getSize()), eq(MediaType.IMAGE_PNG_VALUE));
        }

        @Test
        @DisplayName("Should successfully upload WEBP avatar and return response")
        void uploadAvatar_ValidWebpFile_UploadsAndReturnsResponse() {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.webp", "image/webp", "webp image content".getBytes()
            );

            when(fileStoragePort.uploadFile(
                eq("avatars/batuhan.webp"),
                any(InputStream.class),
                eq(file.getSize()),
                eq("image/webp")
            )).thenReturn("avatars/batuhan.webp");

            // Act
            AvatarUploadResponse response = userService.uploadAvatar(file);

            // Assert
            assertNotNull(response);
            assertEquals("/api/users/batuhan/avatar", response.avatarUrl());
            verify(fileStoragePort, times(1)).uploadFile(eq("avatars/batuhan.webp"), any(InputStream.class), eq(file.getSize()), eq("image/webp"));
            verify(userRepository, times(1)).save(testUser);
        }

        @Test
        @DisplayName("Should delete old avatar files before uploading new avatar")
        void uploadAvatar_ExistingAvatar_CleansOldFilesFirst() {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", MediaType.IMAGE_PNG_VALUE, "dummy image content".getBytes()
            );

            when(fileStoragePort.doesFileExist("avatars/batuhan.jpg")).thenReturn(true);
            when(fileStoragePort.uploadFile(anyString(), any(InputStream.class), anyLong(), anyString()))
                .thenReturn("avatars/batuhan.png");

            // Act
            userService.uploadAvatar(file);

            // Assert
            verify(fileStoragePort, times(1)).deleteFile("avatars/batuhan.jpg");
            verify(fileStoragePort, times(1)).uploadFile(eq("avatars/batuhan.png"), any(InputStream.class), eq(file.getSize()), eq(MediaType.IMAGE_PNG_VALUE));
        }

        @Test
        @DisplayName("Should throw exception when file is empty")
        void uploadAvatar_EmptyFile_ThrowsException() {
            // Arrange
            MultipartFile emptyFile = new MockMultipartFile("file", new byte[0]);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.uploadAvatar(emptyFile));
            assertEquals("Avatar file cannot be empty", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when content type is unsupported")
        void uploadAvatar_UnsupportedContentType_ThrowsException() {
            // Arrange
            MockMultipartFile textFile = new MockMultipartFile(
                "file", "test.txt", MediaType.TEXT_PLAIN_VALUE, "content".getBytes()
            );

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.uploadAvatar(textFile));
            assertEquals("Only PNG, JPEG, and WEBP formats are supported", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when file size exceeds 2MB limit")
        void uploadAvatar_FileTooLarge_ThrowsException() {
            // Arrange
            byte[] largeContent = new byte[2 * 1024 * 1024 + 1];
            MockMultipartFile largeFile = new MockMultipartFile(
                "file", "large.png", MediaType.IMAGE_PNG_VALUE, largeContent
            );

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.uploadAvatar(largeFile));
            assertEquals("Avatar size must not exceed 2MB", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Avatar Delete Tests")
    class DeleteAvatarTests {

        @Test
        @DisplayName("Should successfully delete avatar, clear files, and nullify avatarUrl")
        void deleteAvatar_WhenCalled_CleansFilesAndNullifiesUserAvatarUrl() {
            // Arrange
            testUser.setAvatarUrl("/api/users/batuhan/avatar");
            when(fileStoragePort.doesFileExist("avatars/batuhan.png")).thenReturn(true);

            // Act
            userService.deleteAvatar();

            // Assert
            assertNull(testUser.getAvatarUrl());
            verify(fileStoragePort, times(1)).deleteFile("avatars/batuhan.png");
            verify(userRepository, times(1)).save(testUser);
        }
    }

    @Nested
    @DisplayName("Avatar Download Tests")
    class GetAvatarTests {

        @Test
        @DisplayName("Should download PNG avatar when file exists")
        void getAvatar_PngExists_ReturnsFileDownloadDTO() {
            // Arrange
            String username = "batuhan";
            byte[] dummyData = "png content".getBytes();

            when(fileStoragePort.doesFileExist("avatars/batuhan.webp")).thenReturn(false);
            when(fileStoragePort.doesFileExist("avatars/batuhan.png")).thenReturn(true);
            when(fileStoragePort.downloadFile("avatars/batuhan.png")).thenReturn(dummyData);

            // Act
            FileDownloadDTO result = userService.getAvatar(username);

            // Assert
            assertNotNull(result);
            assertArrayEquals(dummyData, result.data());
            assertEquals(MediaType.IMAGE_PNG_VALUE, result.contentType());
            assertEquals("batuhan.png", result.fileName());
        }

        @Test
        @DisplayName("Should download WEBP avatar when file exists")
        void getAvatar_WebpExists_ReturnsFileDownloadDTO() {
            // Arrange
            String username = "batuhan";
            byte[] dummyData = "webp content".getBytes();

            when(fileStoragePort.doesFileExist("avatars/batuhan.webp")).thenReturn(true);
            when(fileStoragePort.downloadFile("avatars/batuhan.webp")).thenReturn(dummyData);

            // Act
            FileDownloadDTO result = userService.getAvatar(username);

            // Assert
            assertNotNull(result);
            assertArrayEquals(dummyData, result.data());
            assertEquals("image/webp", result.contentType());
            assertEquals("batuhan.webp", result.fileName());
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when avatar does not exist")
        void getAvatar_FileDoesNotExist_ThrowsException() {
            // Arrange
            String username = "unknown";

            when(fileStoragePort.doesFileExist(anyString())).thenReturn(false);

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> userService.getAvatar(username));
            assertTrue(exception.getMessage().contains("Avatar not found for user: unknown"));
        }
    }
}
