package com.batuhan.chess.api.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Redis Configuration Context Runner Tests")
class RedisConfigTest {

    @Test
    @DisplayName("Should respect '!test' profile and not load Redis beans when profile is test")
    void shouldNotLoadRedisBeansWhenTestProfileActive() {
        // Arrange
        ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(RedisConfig.class)
            .withPropertyValues("spring.profiles.active=test");

        // Act & Assert
        contextRunner.run(context -> {
            assertThat(context).doesNotHaveBean(RedisConfig.class);
        });
    }
}
