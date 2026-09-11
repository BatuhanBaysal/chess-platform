package com.batuhan.chess.application.service.storage;

import com.batuhan.chess.api.config.S3Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3StorageAdapterTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private S3Properties s3Properties;

    @InjectMocks
    private S3StorageAdapter storageAdapter;

    private final String testKey = "avatars/batuhan.png";

    @BeforeEach
    void setUp() {
        String bucketName = "chess-storage";
        lenient().when(s3Properties.getBucketName()).thenReturn(bucketName);
    }

    @Nested
    @DisplayName("Upload File Tests")
    class UploadFileTests {

        @Test
        @DisplayName("Should successfully upload file when bucket already exists")
        void uploadFile_BucketExists_UploadsSuccessfully() {
            // Arrange
            byte[] content = "dummy-image-data".getBytes();
            InputStream inputStream = new ByteArrayInputStream(content);
            when(s3Client.headBucket(any(HeadBucketRequest.class))).thenReturn(HeadBucketResponse.builder().build());
            when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

            // Act
            String uploadedKey = storageAdapter.uploadFile(testKey, inputStream, content.length, "image/png");

            // Assert
            assertEquals(testKey, uploadedKey);
            verify(s3Client, times(1)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
            verify(s3Client, never()).createBucket(any(CreateBucketRequest.class));
        }

        @Test
        @DisplayName("Should create bucket and upload file when bucket does not exist")
        void uploadFile_BucketDoesNotExist_CreatesBucketAndUploads() {
            // Arrange
            byte[] content = "dummy-image-data".getBytes();
            InputStream inputStream = new ByteArrayInputStream(content);
            when(s3Client.headBucket(any(HeadBucketRequest.class))).thenThrow(NoSuchBucketException.builder().build());
            when(s3Client.createBucket(any(CreateBucketRequest.class))).thenReturn(CreateBucketResponse.builder().build());
            when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

            // Act
            String uploadedKey = storageAdapter.uploadFile(testKey, inputStream, content.length, "image/png");

            // Assert
            assertEquals(testKey, uploadedKey);
            verify(s3Client, times(1)).createBucket(any(CreateBucketRequest.class));
            verify(s3Client, times(1)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
        }

        @Test
        @DisplayName("Should throw RuntimeException when S3 putObject fails")
        void uploadFile_S3Error_ThrowsRuntimeException() {
            // Arrange
            byte[] content = "dummy-data".getBytes();
            InputStream inputStream = new ByteArrayInputStream(content);
            when(s3Client.headBucket(any(HeadBucketRequest.class))).thenReturn(HeadBucketResponse.builder().build());
            when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenThrow(S3Exception.builder().message("Access Denied").build());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> storageAdapter.uploadFile(testKey, inputStream, content.length, "image/png"));
            assertTrue(exception.getMessage().contains("Could not upload file"));
        }
    }

    @Nested
    @DisplayName("Download File Tests")
    class DownloadFileTests {

        @Test
        @DisplayName("Should successfully download and return file bytes")
        void downloadFile_FileExists_ReturnsByteArray() {
            // Arrange
            byte[] expectedBytes = "file content".getBytes();
            ResponseBytes<GetObjectResponse> responseBytes = ResponseBytes.fromByteArray(
                GetObjectResponse.builder().build(), expectedBytes
            );
            when(s3Client.getObjectAsBytes(any(GetObjectRequest.class))).thenReturn(responseBytes);

            // Act
            byte[] actualBytes = storageAdapter.downloadFile(testKey);

            // Assert
            assertNotNull(actualBytes);
            assertArrayEquals(expectedBytes, actualBytes);
            verify(s3Client, times(1)).getObjectAsBytes(any(GetObjectRequest.class));
        }

        @Test
        @DisplayName("Should throw RuntimeException when file is not found (NoSuchKeyException)")
        void downloadFile_FileNotFound_ThrowsRuntimeException() {
            // Arrange
            when(s3Client.getObjectAsBytes(any(GetObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("Key not found").build());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> storageAdapter.downloadFile(testKey));
            assertTrue(exception.getMessage().contains("File not found: " + testKey));
        }
    }

    @Nested
    @DisplayName("Delete File Tests")
    class DeleteFileTests {

        @Test
        @DisplayName("Should successfully delete file from storage")
        void deleteFile_ValidKey_DeletesObject() {
            // Arrange
            when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .thenReturn(DeleteObjectResponse.builder().build());

            // Act
            storageAdapter.deleteFile(testKey);

            // Assert
            verify(s3Client, times(1)).deleteObject(any(DeleteObjectRequest.class));
        }

        @Test
        @DisplayName("Should throw RuntimeException when delete fails")
        void deleteFile_S3Error_ThrowsRuntimeException() {
            // Arrange
            when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .thenThrow(S3Exception.builder().message("Network error").build());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> storageAdapter.deleteFile(testKey));
            assertTrue(exception.getMessage().contains("Could not delete file: " + testKey));
        }
    }

    @Nested
    @DisplayName("Does File Exist Tests")
    class DoesFileExistTests {

        @Test
        @DisplayName("Should return true when headObject succeeds")
        void doesFileExist_FilePresent_ReturnsTrue() {
            // Arrange
            when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenReturn(HeadObjectResponse.builder().build());

            // Act
            boolean exists = storageAdapter.doesFileExist(testKey);

            // Assert
            assertTrue(exists);
            verify(s3Client, times(1)).headObject(any(HeadObjectRequest.class));
        }

        @Test
        @DisplayName("Should return false when NoSuchKeyException is thrown")
        void doesFileExist_FileMissing_ReturnsFalse() {
            // Arrange
            when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().build());

            // Act
            boolean exists = storageAdapter.doesFileExist(testKey);

            // Assert
            assertFalse(exists);
        }

        @Test
        @DisplayName("Should return false when generic S3Exception occurs")
        void doesFileExist_S3ExceptionOccurs_ReturnsFalse() {
            // Arrange
            when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(S3Exception.builder().message("Forbidden").build());

            // Act
            boolean exists = storageAdapter.doesFileExist(testKey);

            // Assert
            assertFalse(exists);
        }
    }
}
