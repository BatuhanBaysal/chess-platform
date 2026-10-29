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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("S3StorageAdapter Implementation Tests")
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
        lenient().when(s3Properties.getBucketName()).thenReturn("chess-storage");
    }

    @Nested
    @DisplayName("File Upload")
    class UploadFileTests {

        @Test
        @DisplayName("Should upload file directly when bucket already exists")
        void shouldUploadFile_WhenBucketExists() {
            // Arrange
            byte[] content = "dummy-image-data".getBytes();
            InputStream inputStream = new ByteArrayInputStream(content);
            when(s3Client.headBucket(any(HeadBucketRequest.class))).thenReturn(HeadBucketResponse.builder().build());
            when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

            // Act
            String uploadedKey = storageAdapter.uploadFile(testKey, inputStream, content.length, "image/png");

            // Assert
            assertThat(uploadedKey).isEqualTo(testKey);
            verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
            verify(s3Client, never()).createBucket(any(CreateBucketRequest.class));
        }

        @Test
        @DisplayName("Should create bucket and upload file when bucket does not exist")
        void shouldCreateBucketAndUpload_WhenBucketDoesNotExist() {
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
            assertThat(uploadedKey).isEqualTo(testKey);
            verify(s3Client).createBucket(any(CreateBucketRequest.class));
            verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
        }

        @Test
        @DisplayName("Should throw RuntimeException when S3 putObject operation fails")
        void shouldThrowException_WhenPutObjectFails() {
            // Arrange
            byte[] content = "dummy-data".getBytes();
            InputStream inputStream = new ByteArrayInputStream(content);
            when(s3Client.headBucket(any(HeadBucketRequest.class))).thenReturn(HeadBucketResponse.builder().build());
            when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenThrow(S3Exception.builder().message("Access Denied").build());

            // Act & Assert
            assertThatThrownBy(() -> storageAdapter.uploadFile(testKey, inputStream, content.length, "image/png"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Could not upload file: " + testKey);
        }
    }

    @Nested
    @DisplayName("File Download")
    class DownloadFileTests {

        @Test
        @DisplayName("Should return byte array payload when file exists in storage")
        void shouldReturnBytes_WhenFileExists() {
            // Arrange
            byte[] expectedBytes = "file content".getBytes();
            ResponseBytes<GetObjectResponse> responseBytes = ResponseBytes.fromByteArray(
                GetObjectResponse.builder().build(), expectedBytes
            );
            when(s3Client.getObjectAsBytes(any(GetObjectRequest.class))).thenReturn(responseBytes);

            // Act
            byte[] actualBytes = storageAdapter.downloadFile(testKey);

            // Assert
            assertThat(actualBytes).isEqualTo(expectedBytes);
            verify(s3Client).getObjectAsBytes(any(GetObjectRequest.class));
        }

        @Test
        @DisplayName("Should throw RuntimeException when requested key does not exist")
        void shouldThrowException_WhenKeyNotFound() {
            // Arrange
            when(s3Client.getObjectAsBytes(any(GetObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("Key not found").build());

            // Act & Assert
            assertThatThrownBy(() -> storageAdapter.downloadFile(testKey))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("File not found: " + testKey);
        }
    }

    @Nested
    @DisplayName("File Deletion")
    class DeleteFileTests {

        @Test
        @DisplayName("Should delete object from S3 when key is valid")
        void shouldDeleteObject_WhenKeyIsValid() {
            // Arrange
            when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .thenReturn(DeleteObjectResponse.builder().build());

            // Act
            storageAdapter.deleteFile(testKey);

            // Assert
            verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
        }

        @Test
        @DisplayName("Should throw RuntimeException when delete operation encounters S3 error")
        void shouldThrowException_WhenDeleteOperationFails() {
            // Arrange
            when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .thenThrow(S3Exception.builder().message("Network error").build());

            // Act & Assert
            assertThatThrownBy(() -> storageAdapter.deleteFile(testKey))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Could not delete file: " + testKey);
        }
    }

    @Nested
    @DisplayName("Existence Checks")
    class ExistenceTests {

        @Test
        @DisplayName("Should return true when headObject succeeds")
        void shouldReturnTrue_WhenHeadObjectSucceeds() {
            // Arrange
            when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenReturn(HeadObjectResponse.builder().build());

            // Act
            boolean exists = storageAdapter.doesFileExist(testKey);

            // Assert
            assertThat(exists).isTrue();
        }

        @Test
        @DisplayName("Should return false when NoSuchKeyException is thrown")
        void shouldReturnFalse_WhenNoSuchKeyExceptionThrown() {
            // Arrange
            when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().build());

            // Act
            boolean exists = storageAdapter.doesFileExist(testKey);

            // Assert
            assertThat(exists).isFalse();
        }

        @Test
        @DisplayName("Should return false when generic S3Exception occurs during existence check")
        void shouldReturnFalse_WhenGenericS3ExceptionOccurs() {
            // Arrange
            when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(S3Exception.builder().message("Forbidden").build());

            // Act
            boolean exists = storageAdapter.doesFileExist(testKey);

            // Assert
            assertThat(exists).isFalse();
        }
    }
}
