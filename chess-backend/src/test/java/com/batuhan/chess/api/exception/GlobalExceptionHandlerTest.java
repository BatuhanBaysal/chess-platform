package com.batuhan.chess.api.exception;

import com.batuhan.chess.api.dto.error.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Technical test suite for GlobalExceptionHandler.
 * Ensures cross-cutting exception mapping to appropriate HTTP statuses
 * and validates the structure of the ErrorResponse DTO.
 */
@DisplayName("Global Exception Handler Technical Tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Nested
    @DisplayName("Runtime Exception Management")
    class RuntimeExceptionTests {

        @Test
        @DisplayName("Should map generic runtime exceptions to 400 Bad Request with original message")
        void shouldHandleRuntimeExceptionWithBadRequest() {
            // Arrange
            String message = "Unexpected error occurred";
            RuntimeException ex = new RuntimeException(message);

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleRuntimeException(ex);

            // Assert
            assertThat(response)
                .isNotNull()
                .satisfies(res -> {
                    assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(res.getBody()).isNotNull();
                    assertThat(res.getBody().message()).isEqualTo(message);
                    assertThat(res.getBody().status()).isEqualTo(400);
                });
        }
    }

    @Nested
    @DisplayName("Authentication and Security Logic")
    class AuthExceptionTests {

        @Test
        @DisplayName("Should return 401 Unauthorized for invalid credential attempts")
        void shouldHandleBadCredentialsWithUnauthorized() {
            // Arrange
            BadCredentialsException ex = new BadCredentialsException("Internal auth failure");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleBadCredentials(ex);

            // Assert
            assertThat(response).satisfies(res -> {
                assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                assertThat(res.getBody()).isNotNull();
                assertThat(res.getBody().message()).isEqualTo("Invalid username or password");
                assertThat(res.getBody().status()).isEqualTo(401);
            });
        }
    }

    @Nested
    @DisplayName("Validation and Constraint Management")
    class ValidationExceptionTests {

        @Test
        @DisplayName("Should format field-specific validation errors into a readable detail message")
        void shouldFormatValidationErrorsToBadRequest() {
            // Arrange
            MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
            BindingResult bindingResult = mock(BindingResult.class);
            FieldError fieldError = new FieldError("object", "username", "must not be empty");

            when(ex.getBindingResult()).thenReturn(bindingResult);
            when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleValidationErrors(ex);

            // Assert
            assertThat(response).satisfies(res -> {
                assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                assertThat(res.getBody()).isNotNull();
                assertThat(res.getBody().message()).contains("username: must not be empty");
            });
        }
    }

    @Nested
    @DisplayName("Domain Logic and Resource Integrity")
    class IllegalArgumentTests {

        @Test
        @DisplayName("Should return 404 Not Found for domain-driven illegal argument exceptions")
        void shouldHandleIllegalArgumentWithNotFound() {
            // Arrange
            String message = "Game session not found";
            IllegalArgumentException ex = new IllegalArgumentException(message);

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleIllegalArgument(ex);

            // Assert
            assertThat(response).satisfies(res -> {
                assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                assertThat(res.getBody()).isNotNull();
                assertThat(res.getBody().message()).isEqualTo(message);
                assertThat(res.getBody().status()).isEqualTo(404);
            });
        }
    }
}
