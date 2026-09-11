package com.batuhan.chess.api.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("S3Properties Configuration Binding Tests")
class S3PropertiesTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
        .withUserConfiguration(TestConfig.class);

    @EnableConfigurationProperties(S3Properties.class)
    static class TestConfig {}

    @Test
    @DisplayName("Should bind custom properties successfully from environment")
    void shouldBindPropertiesSuccessfully() {
        // Arrange & Act
        contextRunner
            .withPropertyValues(
                "chess.storage.s3.endpoint=http://localhost:9000",
                "chess.storage.s3.region=eu-central-1",
                "chess.storage.s3.access-key=customAccessKey",
                "chess.storage.s3.secret-key=customSecretKey",
                "chess.storage.s3.bucket-name=custom-bucket",
                "chess.storage.s3.path-style-access-enabled=false"
            )
            .run(context -> {
                // Assert
                S3Properties properties = context.getBean(S3Properties.class);
                assertNotNull(properties);
                assertEquals("http://localhost:9000", properties.getEndpoint());
                assertEquals("eu-central-1", properties.getRegion());
                assertEquals("customAccessKey", properties.getAccessKey());
                assertEquals("customSecretKey", properties.getSecretKey());
                assertEquals("custom-bucket", properties.getBucketName());
                assertFalse(properties.isPathStyleAccessEnabled());
            });
    }

    @Test
    @DisplayName("Should use default property values when not specified")
    void shouldUseDefaultValues() {
        // Arrange & Act & Assert
        contextRunner.run(context -> {
            S3Properties properties = context.getBean(S3Properties.class);
            assertNotNull(properties);
            assertEquals("us-east-1", properties.getRegion());
            assertEquals("chess-storage", properties.getBucketName());
            assertTrue(properties.isPathStyleAccessEnabled());
            assertNull(properties.getEndpoint());
            assertNull(properties.getAccessKey());
            assertNull(properties.getSecretKey());
        });
    }
}
