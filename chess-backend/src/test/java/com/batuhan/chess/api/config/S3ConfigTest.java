package com.batuhan.chess.api.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import software.amazon.awssdk.services.s3.S3Client;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@DisplayName("S3Config Bean Creation Tests")
class S3ConfigTest {

    @Test
    @DisplayName("Should create S3Client bean with given S3Properties")
    void shouldCreateS3ClientBeanSuccessfully() {
        // Arrange
        S3Properties properties = new S3Properties();
        properties.setEndpoint("http://localhost:9000");
        properties.setRegion("us-east-1");
        properties.setAccessKey("minioadmin");
        properties.setSecretKey("minioadmin");
        properties.setBucketName("chess-storage");
        properties.setPathStyleAccessEnabled(true);

        S3Config config = new S3Config(properties);

        // Act
        S3Client s3Client = config.s3Client();

        // Assert
        assertNotNull(s3Client);
        s3Client.close();
    }
}
