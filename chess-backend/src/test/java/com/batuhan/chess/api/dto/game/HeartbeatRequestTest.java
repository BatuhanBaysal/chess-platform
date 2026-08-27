package com.batuhan.chess.api.dto.game;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("HeartbeatRequest Validation Tests")
class HeartbeatRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when valid gameId and userId are provided")
    void shouldPassWhenValid() {
        // Arrange
        HeartbeatRequest request = new HeartbeatRequest("game-123", 5L);

        // Act
        Set<ConstraintViolation<HeartbeatRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when gameId is blank and userId is null")
    void shouldFailWhenInvalid() {
        // Arrange
        HeartbeatRequest request = new HeartbeatRequest("   ", null);

        // Act
        Set<ConstraintViolation<HeartbeatRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(2);
    }
}
