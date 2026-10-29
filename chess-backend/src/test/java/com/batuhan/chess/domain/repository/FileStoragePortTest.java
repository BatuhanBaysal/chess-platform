package com.batuhan.chess.domain.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FileStoragePort Contract Tests")
class FileStoragePortTest {

    @Mock
    private FileStoragePort fileStoragePort;

    private static final String SAMPLE_KEY = "avatars/batuhan.png";

    @Nested
    @DisplayName("uploadFile")
    class UploadFileTests {

        @Test
        @DisplayName("Should return storage key when file upload succeeds")
        void shouldReturnKey_WhenUploadIsSuccessful() {
            // Arrange
            byte[] data = "sample avatar image bytes".getBytes();
            InputStream inputStream = new ByteArrayInputStream(data);
            when(fileStoragePort.uploadFile(SAMPLE_KEY, inputStream, data.length, "image/png"))
                .thenReturn(SAMPLE_KEY);

            // Act
            String result = fileStoragePort.uploadFile(SAMPLE_KEY, inputStream, data.length, "image/png");

            // Assert
            assertThat(result).isEqualTo(SAMPLE_KEY);
            verify(fileStoragePort, times(1)).uploadFile(SAMPLE_KEY, inputStream, data.length, "image/png");
        }

        @Test
        @DisplayName("Should throw RuntimeException when storage provider fails during upload")
        void shouldThrowException_WhenStorageProviderFails() {
            // Arrange
            byte[] data = "sample data".getBytes();
            InputStream inputStream = new ByteArrayInputStream(data);
            when(fileStoragePort.uploadFile(SAMPLE_KEY, inputStream, data.length, "image/png"))
                .thenThrow(new RuntimeException("S3 unavailable"));

            // Act & Assert
            assertThatThrownBy(() -> fileStoragePort.uploadFile(SAMPLE_KEY, inputStream, data.length, "image/png"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("S3 unavailable");
        }
    }

    @Nested
    @DisplayName("downloadFile")
    class DownloadFileTests {

        @Test
        @DisplayName("Should return byte array when requested file exists in storage")
        void shouldReturnBytes_WhenFileExists() {
            // Arrange
            byte[] expectedData = "stored binary payload".getBytes();
            when(fileStoragePort.downloadFile(SAMPLE_KEY)).thenReturn(expectedData);

            // Act
            byte[] actualData = fileStoragePort.downloadFile(SAMPLE_KEY);

            // Assert
            assertThat(actualData).isEqualTo(expectedData);
            verify(fileStoragePort, times(1)).downloadFile(SAMPLE_KEY);
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when requested file does not exist")
        void shouldThrowException_WhenFileNotFound() {
            // Arrange
            when(fileStoragePort.downloadFile(SAMPLE_KEY))
                .thenThrow(new IllegalArgumentException("Object not found: " + SAMPLE_KEY));

            // Act & Assert
            assertThatThrownBy(() -> fileStoragePort.downloadFile(SAMPLE_KEY))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Object not found");
        }
    }

    @Nested
    @DisplayName("deleteFile")
    class DeleteFileTests {

        @Test
        @DisplayName("Should execute delete operation when storage key is provided")
        void shouldExecuteDelete_WhenKeyIsProvided() {
            // Arrange
            doNothing().when(fileStoragePort).deleteFile(SAMPLE_KEY);

            // Act
            fileStoragePort.deleteFile(SAMPLE_KEY);

            // Assert
            verify(fileStoragePort, times(1)).deleteFile(SAMPLE_KEY);
        }
    }

    @Nested
    @DisplayName("doesFileExist")
    class DoesFileExistTests {

        @Test
        @DisplayName("Should return true when file exists in storage bucket")
        void shouldReturnTrue_WhenFileExistsInBucket() {
            // Arrange
            when(fileStoragePort.doesFileExist(SAMPLE_KEY)).thenReturn(true);

            // Act
            boolean exists = fileStoragePort.doesFileExist(SAMPLE_KEY);

            // Assert
            assertThat(exists).isTrue();
            verify(fileStoragePort, times(1)).doesFileExist(SAMPLE_KEY);
        }

        @Test
        @DisplayName("Should return false when file does not exist in storage bucket")
        void shouldReturnFalse_WhenFileDoesNotExistInBucket() {
            // Arrange
            when(fileStoragePort.doesFileExist(SAMPLE_KEY)).thenReturn(false);

            // Act
            boolean exists = fileStoragePort.doesFileExist(SAMPLE_KEY);

            // Assert
            assertThat(exists).isFalse();
            verify(fileStoragePort, times(1)).doesFileExist(SAMPLE_KEY);
        }
    }
}
