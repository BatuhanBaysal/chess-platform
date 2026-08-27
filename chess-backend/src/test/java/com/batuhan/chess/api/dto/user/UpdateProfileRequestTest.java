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

@DisplayName("UpdateProfileRequest Validation Tests")
class UpdateProfileRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when username and email are valid")
    void shouldPassWhenValid() {
        // Arrange
        UpdateProfileRequest request = new UpdateProfileRequest("batuhan", "batuhan@chess.com");

        // Act
        Set<ConstraintViolation<UpdateProfileRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when username is too short and email format is invalid")
    void shouldFailWhenInvalid() {
        // Arrange
        UpdateProfileRequest request = new UpdateProfileRequest("ab", "invalid-email");

        // Act
        Set<ConstraintViolation<UpdateProfileRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(2);
    }
}
