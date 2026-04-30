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
 * Updated technical test suite for GlobalExceptionHandler.
 * Validates the mapping of domain-specific exceptions (GameOperation, Conflicts)
 * and generic fallback handlers.
 */
@DisplayName("Global Exception Handler Technical Tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Nested
    @DisplayName("Domain and Game Logic Exceptions")
    class GameExceptionTests {

        @Test
        @DisplayName("Should map GameOperationException to 400 Bad Request")
        void shouldHandleGameOperationException() {
            // Arrange
            String message = "Chess service is currently unavailable";
            GameOperationException ex = new GameOperationException(message);

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleGameOperation(ex);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.message()).isEqualTo(message);
                assertThat(body.status()).isEqualTo(400);
            });
        }

        @Test
        @DisplayName("Should map UserAlreadyExistsException to 409 Conflict")
        void shouldHandleUserAlreadyExistsConflict() {
            // Arrange
            UserAlreadyExistsException ex = new UserAlreadyExistsException("User already exists");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleConflict(ex);
            ErrorResponse body = response.getBody();

            // Assert
            assertThat(body).isNotNull();
            assertThat(body.status()).isEqualTo(409);
            assertThat(body.message()).isEqualTo("User already exists");
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
    @DisplayName("System and Generic Fallbacks")
    class GeneralExceptionTests {

        @Test
        @DisplayName("Should map any unhandled Exception to 500 Internal Server Error")
        void shouldHandleGeneralException() {
            // Arrange
            Exception ex = new Exception("Unexpected system failure");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleGeneralException(ex);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.message()).contains("An unexpected error occurred");
                assertThat(body.status()).isEqualTo(500);
            });
        }
    }
}
