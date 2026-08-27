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

@DisplayName("ChangePasswordRequest Validation Tests")
class ChangePasswordRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when currentPassword and valid newPassword are provided")
    void shouldPassWhenValid() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest("oldPass123", "newPass123");

        // Act
        Set<ConstraintViolation<ChangePasswordRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when fields are blank or newPassword is too weak")
    void shouldFailWhenInvalid() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest("", "123");

        // Act
        Set<ConstraintViolation<ChangePasswordRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(2);
    }
}
