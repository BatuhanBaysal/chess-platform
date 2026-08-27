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

@DisplayName("JoinRoomRequest Validation Tests")
class JoinRoomRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should pass validation when all fields are provided correctly")
    void shouldPassWhenValid() {
        // Arrange
        JoinRoomRequest request = JoinRoomRequest.builder()
            .roomId("room-123")
            .userId(2L)
            .username("opponent")
            .theme("classic")
            .build();

        // Act
        Set<ConstraintViolation<JoinRoomRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when roomId and username/theme are blank and userId is null")
    void shouldFailWhenInvalid() {
        // Arrange
        JoinRoomRequest request = JoinRoomRequest.builder()
            .roomId("")
            .userId(null)
            .username("   ")
            .theme("")
            .build();

        // Act
        Set<ConstraintViolation<JoinRoomRequest>> violations = validator.validate(request);

        // Assert
        assertThat(violations)
            .isNotEmpty()
            .hasSize(4);
    }
}
