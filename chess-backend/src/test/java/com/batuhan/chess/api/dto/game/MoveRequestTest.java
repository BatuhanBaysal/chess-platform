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

@DisplayName("MoveRequest Validation Tests")
class MoveRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when all required move coordinates are provided")
    void shouldPassWhenValid() {
        // Arrange
        MoveRequest request = new MoveRequest("game-123", 4, 1, 4, 3, "QUEEN");

        // Act
        Set<ConstraintViolation<MoveRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when required coordinates are null")
    void shouldFailWhenNullFields() {
        // Arrange
        MoveRequest request = new MoveRequest(null, null, null, null, null, null);

        // Act
        Set<ConstraintViolation<MoveRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(5);
    }
}
