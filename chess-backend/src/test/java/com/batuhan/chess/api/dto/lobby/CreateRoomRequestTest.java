package com.batuhan.chess.api.dto.lobby;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CreateRoomRequest Validation Tests")
class CreateRoomRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when all fields are valid")
    void shouldPassWhenValid() {
        // Arrange
        CreateRoomRequest request = CreateRoomRequest.builder()
            .userId(1L)
            .username("batuhan")
            .time(5)
            .theme("classic")
            .build();

        // Act
        Set<ConstraintViolation<CreateRoomRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when userId is null, username/theme are blank, and time is less than 1")
    void shouldFailWhenInvalid() {
        // Arrange
        CreateRoomRequest request = CreateRoomRequest.builder()
            .userId(null)
            .username("   ")
            .time(0)
            .theme("")
            .build();

        // Act
        Set<ConstraintViolation<CreateRoomRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(4);
    }
}
