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

@DisplayName("LoginRequest Validation Tests")
class LoginRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when usernameOrEmail and password are provided")
    void shouldPassWhenValid() {
        // Arrange
        LoginRequest request = new LoginRequest("batuhan", "Password123");

        // Act
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when fields are blank")
    void shouldFailWhenBlank() {
        // Arrange
        LoginRequest request = new LoginRequest("", "   ");

        // Act
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(2);
    }
}
