package com.batuhan.chess.api.dto.error;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ErrorResponse Unit Tests")
class ErrorResponseTest {

    @Test
    @DisplayName("Should create ErrorResponse with full constructor and retain all fields")
    void shouldCreateErrorResponseWithFullConstructor() {
        // Arrange
        int status = 400;
        String message = "Validation failed";
        String path = "/api/auth/register";
        LocalDateTime timestamp = LocalDateTime.now(ZoneId.of("UTC"));
        Map<String, String> validationErrors = Map.of("username", "Size must be between 3 and 20");

        // Act
        ErrorResponse response = new ErrorResponse(status, message, path, timestamp, validationErrors);

        // Assert
        assertThat(response)
            .isNotNull();
        assertThat(response.status()).isEqualTo(status);
        assertThat(response.message()).isEqualTo(message);
        assertThat(response.path()).isEqualTo(path);
        assertThat(response.timestamp()).isEqualTo(timestamp);
        assertThat(response.validationErrors())
            .isNotEmpty()
            .containsEntry("username", "Size must be between 3 and 20");
    }

    @Test
    @DisplayName("Should create ErrorResponse with concise constructor, defaulting timestamp to UTC and validation errors to null")
    void shouldCreateErrorResponseWithConciseConstructor() {
        // Arrange
        int status = 404;
        String message = "Resource not found";
        String path = "/api/games/999";

        // Act
        ErrorResponse response = new ErrorResponse(status, message, path);

        // Assert
        assertThat(response)
            .isNotNull();
        assertThat(response.status()).isEqualTo(status);
        assertThat(response.message()).isEqualTo(message);
        assertThat(response.path()).isEqualTo(path);
        assertThat(response.timestamp()).isNotNull();
        assertThat(response.validationErrors()).isNull();
    }
}
