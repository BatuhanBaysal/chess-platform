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

@DisplayName("DismissRequest Validation Tests")
class DismissRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when gameId and userId are valid")
    void shouldPassWhenValid() {
        // Arrange
        DismissRequest request = new DismissRequest("game-123", 1L);

        // Act
        Set<ConstraintViolation<DismissRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when gameId is blank and userId is null")
    void shouldFailWhenInvalid() {
        // Arrange
        DismissRequest request = new DismissRequest("", null);

        // Act
        Set<ConstraintViolation<DismissRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(2);
    }
}
