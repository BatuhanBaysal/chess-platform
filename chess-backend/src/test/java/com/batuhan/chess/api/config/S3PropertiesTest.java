package com.batuhan.chess.api.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

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
                assertThat(properties).isNotNull();
                assertThat(properties.getEndpoint()).isEqualTo("http://localhost:9000");
                assertThat(properties.getRegion()).isEqualTo("eu-central-1");
                assertThat(properties.getAccessKey()).isEqualTo("customAccessKey");
                assertThat(properties.getSecretKey()).isEqualTo("customSecretKey");
                assertThat(properties.getBucketName()).isEqualTo("custom-bucket");
                assertThat(properties.isPathStyleAccessEnabled()).isFalse();
            });
    }

    @Test
    @DisplayName("Should use default property values when not specified")
    void shouldUseDefaultValues() {
        // Arrange & Act & Assert
        contextRunner.run(context -> {
            S3Properties properties = context.getBean(S3Properties.class);
            assertThat(properties).isNotNull();
            assertThat(properties.getRegion()).isEqualTo("us-east-1");
            assertThat(properties.getBucketName()).isEqualTo("chess-storage");
            assertThat(properties.isPathStyleAccessEnabled()).isTrue();
            assertThat(properties.getEndpoint()).isNull();
            assertThat(properties.getAccessKey()).isNull();
            assertThat(properties.getSecretKey()).isNull();
        });
    }
}
