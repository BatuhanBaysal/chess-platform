package com.batuhan.chess.api.dto.user;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("DeleteAccountRequest Validation Tests")
class DeleteAccountRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when password is provided")
    void shouldPassWhenValid() {
        // Arrange
        DeleteAccountRequest request = new DeleteAccountRequest("secretPassword123");

        // Act
        Set<ConstraintViolation<DeleteAccountRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when password is blank")
    void shouldFailWhenBlank() {
        // Arrange
        DeleteAccountRequest request = new DeleteAccountRequest("   ");

        // Act
        Set<ConstraintViolation<DeleteAccountRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(1);
    }
}
