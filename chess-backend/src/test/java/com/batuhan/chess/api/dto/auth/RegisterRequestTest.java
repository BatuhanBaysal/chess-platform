package com.batuhan.chess.api.dto.auth;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RegisterRequest Validation Tests")
class RegisterRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when all fields meet criteria")
    void shouldPassWhenValid() {
        // Arrange
        RegisterRequest request = new RegisterRequest("batuhan", "batuhan@chess.com", "pass1234");

        // Act
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when username is too short, email is invalid, and password lacks number")
    void shouldFailWhenInvalidFields() {
        // Arrange
        RegisterRequest request = new RegisterRequest("ba", "invalid-email", "password");

        // Act
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(3);
    }

    @Test
    @DisplayName("Should fail validation when password lacks lowercase letters")
    void shouldFailWhenPasswordLacksLowercase() {
        // Arrange
        RegisterRequest request = new RegisterRequest("batuhan", "batuhan@chess.com", "12345678");

        // Act
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .anyMatch(v -> v.getPropertyPath().toString().equals("password"));
    }
}
