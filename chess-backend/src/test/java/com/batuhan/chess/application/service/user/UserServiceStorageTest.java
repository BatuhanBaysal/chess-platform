package com.batuhan.chess.application.service.user;

import com.batuhan.chess.api.dto.storage.FileDownloadDTO;
import com.batuhan.chess.api.dto.user.AvatarUploadResponse;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.domain.repository.FileStoragePort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceStorageTest {

    @Mock
    private FileStoragePort fileStoragePort;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
    }

    @Nested
    @DisplayName("Avatar Upload Tests")
    class UploadAvatarTests {

        @Test
        @DisplayName("Should successfully upload PNG avatar and return response")
        void uploadAvatar_ValidPngFile_UploadsAndReturnsResponse() throws Exception {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", MediaType.IMAGE_PNG_VALUE, "dummy image content".getBytes()
            );

            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("batuhan");

            when(fileStoragePort.uploadFile(
                eq("avatars/batuhan.png"),
                any(InputStream.class),
                eq((long) file.getSize()),
                eq(MediaType.IMAGE_PNG_VALUE)
            )).thenReturn("avatars/batuhan.png");

            // Act
            AvatarUploadResponse response = userService.uploadAvatar(file);

            // Assert
            assertNotNull(response);
            assertEquals("/api/users/batuhan/avatar", response.avatarUrl());
            assertEquals("Avatar uploaded successfully", response.message());
            verify(fileStoragePort, times(1)).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());
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
            assertEquals("Only PNG and JPEG formats are supported", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when file size exceeds 2MB limit")
        void uploadAvatar_FileTooLarge_ThrowsException() {
            // Arrange
            byte[] largeContent = new byte[3 * 1024 * 1024]; // 3MB
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
    @DisplayName("Avatar Download Tests")
    class GetAvatarTests {

        @Test
        @DisplayName("Should download PNG avatar when file exists")
        void getAvatar_PngExists_ReturnsFileDownloadDTO() {
            // Arrange
            String username = "batuhan";
            byte[] dummyData = "png content".getBytes();

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
        @DisplayName("Should throw ResourceNotFoundException when avatar does not exist")
        void getAvatar_FileDoesNotExist_ThrowsException() {
            // Arrange
            String username = "unknown";

            when(fileStoragePort.doesFileExist("avatars/unknown.png")).thenReturn(false);
            when(fileStoragePort.doesFileExist("avatars/unknown.jpg")).thenReturn(false);

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> userService.getAvatar(username));
            assertTrue(exception.getMessage().contains("Avatar not found for user"));
        }
    }
}
