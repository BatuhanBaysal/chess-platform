package com.batuhan.chess.domain.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FileStoragePort Contract Tests")
class FileStoragePortTest {

    @Mock
    private FileStoragePort fileStoragePort;

    private static final String SAMPLE_KEY = "test/file.txt";

    @Nested
    @DisplayName("Upload Contract")
    class UploadTests {

        @Test
        @DisplayName("Should invoke uploadFile and return storage key when parameters are valid")
        void uploadFile_ValidInput_ReturnsKey() {
            // Arrange
            byte[] data = "sample data".getBytes();
            InputStream inputStream = new ByteArrayInputStream(data);
            when(fileStoragePort.uploadFile(SAMPLE_KEY, inputStream, data.length, "text/plain"))
                .thenReturn(SAMPLE_KEY);

            // Act
            String result = fileStoragePort.uploadFile(SAMPLE_KEY, inputStream, data.length, "text/plain");

            // Assert
            assertEquals(SAMPLE_KEY, result);
            verify(fileStoragePort, times(1))
                .uploadFile(SAMPLE_KEY, inputStream, data.length, "text/plain");
        }
    }

    @Nested
    @DisplayName("Download Contract")
    class DownloadTests {

        @Test
        @DisplayName("Should invoke downloadFile and return byte array")
        void downloadFile_ValidKey_ReturnsBytes() {
            // Arrange
            byte[] expectedData = "downloaded content".getBytes();
            when(fileStoragePort.downloadFile(SAMPLE_KEY)).thenReturn(expectedData);

            // Act
            byte[] actualData = fileStoragePort.downloadFile(SAMPLE_KEY);

            // Assert
            assertNotNull(actualData);
            assertArrayEquals(expectedData, actualData);
            verify(fileStoragePort, times(1)).downloadFile(SAMPLE_KEY);
        }
    }

    @Nested
    @DisplayName("Delete Contract")
    class DeleteTests {

        @Test
        @DisplayName("Should invoke deleteFile with specified key")
        void deleteFile_ValidKey_ExecutesSuccessfully() {
            // Arrange
            doNothing().when(fileStoragePort).deleteFile(SAMPLE_KEY);

            // Act
            fileStoragePort.deleteFile(SAMPLE_KEY);

            // Assert
            verify(fileStoragePort, times(1)).deleteFile(SAMPLE_KEY);
        }
    }

    @Nested
    @DisplayName("Existence Check Contract")
    class DoesFileExistTests {

        @Test
        @DisplayName("Should return true when file exists in storage")
        void doesFileExist_ExistingKey_ReturnsTrue() {
            // Arrange
            when(fileStoragePort.doesFileExist(SAMPLE_KEY)).thenReturn(true);

            // Act
            boolean exists = fileStoragePort.doesFileExist(SAMPLE_KEY);

            // Assert
            assertTrue(exists);
            verify(fileStoragePort, times(1)).doesFileExist(SAMPLE_KEY);
        }

        @Test
        @DisplayName("Should return false when file does not exist in storage")
        void doesFileExist_NonExistingKey_ReturnsFalse() {
            // Arrange
            when(fileStoragePort.doesFileExist(SAMPLE_KEY)).thenReturn(false);

            // Act
            boolean exists = fileStoragePort.doesFileExist(SAMPLE_KEY);

            // Assert
            assertFalse(exists);
            verify(fileStoragePort, times(1)).doesFileExist(SAMPLE_KEY);
        }
    }
}
