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

@DisplayName("ReadyRequest Validation Tests")
class ReadyRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when ready request is valid")
    void shouldPassWhenValid() {
        // Arrange
        ReadyRequest request = ReadyRequest.builder()
            .gameId("game-123")
            .userId(1L)
            .build();

        // Act
        Set<ConstraintViolation<ReadyRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when gameId is blank and userId is null")
    void shouldFailWhenInvalid() {
        // Arrange
        ReadyRequest request = ReadyRequest.builder()
            .gameId("")
            .userId(null)
            .build();

        // Act
        Set<ConstraintViolation<ReadyRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(2);
    }
}
