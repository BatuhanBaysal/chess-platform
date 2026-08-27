package com.batuhan.chess.api.config;

import io.micrometer.observation.ObservationRegistry;
import io.micrometer.observation.aop.ObservedAspect;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

@DisplayName("Observation Configuration Tests")
class ObservationConfigTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
        .withUserConfiguration(ObservationConfig.class)
        .withBean(ObservationRegistry.class, () -> mock(ObservationRegistry.class));

    @Test
    @DisplayName("Should successfully create ObservedAspect bean when ObservationRegistry is present")
    void shouldCreateObservedAspectBean() {
        contextRunner.run(context -> {
            // Arrange
            boolean hasBean = context.containsBean("observedAspect");

            // Act
            ObservedAspect observedAspect = context.getBean(ObservedAspect.class);

            // Assert
            assertThat(hasBean).isTrue();
            assertThat(observedAspect).isNotNull();
            assertThat(context).hasSingleBean(ObservedAspect.class);
        });
    }
}
