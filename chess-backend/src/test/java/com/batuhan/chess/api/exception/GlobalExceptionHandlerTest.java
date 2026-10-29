package com.batuhan.chess.api.exception;

import com.batuhan.chess.api.dto.error.ErrorResponse;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DisplayName("GlobalExceptionHandler Unit Tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private HttpServletRequest requestMock;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        requestMock = mock(HttpServletRequest.class);
        when(requestMock.getRequestURI()).thenReturn("/api/test-uri");
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
            ResponseEntity<ErrorResponse> response = handler.handleGameOperation(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(400);
                assertThat(body.message()).isEqualTo(message);
                assertThat(body.path()).isEqualTo("/api/test-uri");
            });
        }

        @Test
        @DisplayName("Should map UserAlreadyExistsException to 409 Conflict")
        void shouldHandleUserAlreadyExistsConflict() {
            // Arrange
            UserAlreadyExistsException ex = new UserAlreadyExistsException("User already exists");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleConflict(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(409);
                assertThat(body.message()).isEqualTo("User already exists");
                assertThat(body.path()).isEqualTo("/api/test-uri");
            });
        }

        @Test
        @DisplayName("Should map EmailAlreadyExistsException to 409 Conflict")
        void shouldHandleEmailAlreadyExistsConflict() {
            // Arrange
            EmailAlreadyExistsException ex = new EmailAlreadyExistsException("Email already exists");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleConflict(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(409);
                assertThat(body.message()).isEqualTo("Email already exists");
                assertThat(body.path()).isEqualTo("/api/test-uri");
            });
        }

        @Test
        @DisplayName("Should map ResourceNotFoundException to 404 Not Found")
        void shouldHandleResourceNotFoundException() {
            // Arrange
            ResourceNotFoundException ex = new ResourceNotFoundException("Game not found with id: 123");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleResourceNotFound(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(404);
                assertThat(body.message()).isEqualTo("Game not found with id: 123");
                assertThat(body.path()).isEqualTo("/api/test-uri");
            });
        }

        @Test
        @DisplayName("Should map IllegalStateException to 400 Bad Request")
        void shouldHandleIllegalStateException() {
            // Arrange
            IllegalStateException ex = new IllegalStateException("Room is invalid or expired");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleIllegalState(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(400);
                assertThat(body.message()).isEqualTo("Room is invalid or expired");
                assertThat(body.path()).isEqualTo("/api/test-uri");
            });
        }
    }

    @Nested
    @DisplayName("Authentication and Security Logic")
    class AuthExceptionTests {

        @Test
        @DisplayName("Should return 401 Unauthorized for invalid credential attempts")
        void shouldHandleBadCredentials() {
            // Arrange
            BadCredentialsException ex = new BadCredentialsException("Internal auth failure");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleBadCredentials(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(401);
                assertThat(body.message()).isEqualTo("Invalid username or password");
                assertThat(body.path()).isEqualTo("/api/test-uri");
            });
        }

        @Test
        @DisplayName("Should return 401 Unauthorized when AccountDeactivatedException is thrown")
        void shouldHandleAccountDeactivated() {
            // Arrange
            AccountDeactivatedException ex = new AccountDeactivatedException("ACCOUNT_DEACTIVATED: User account has been deactivated or deleted.");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleAccountDeactivated(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(401);
                assertThat(body.message()).contains("ACCOUNT_DEACTIVATED");
                assertThat(body.path()).isEqualTo("/api/test-uri");
            });
        }

        @Test
        @DisplayName("Should return 403 Forbidden when AccessDeniedException is thrown")
        void shouldHandleAccessDenied() {
            // Arrange
            AccessDeniedException ex = new AccessDeniedException("Access is denied");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleAccessDenied(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(403);
                assertThat(body.message()).isEqualTo("You do not have permission to access this resource");
                assertThat(body.path()).isEqualTo("/api/test-uri");
            });
        }
    }

    @Nested
    @DisplayName("Validation and Request Format")
    class ValidationExceptionTests {

        @Test
        @DisplayName("Should format validation errors and use default message when available")
        void shouldFormatValidationErrors_WhenMessageIsPresent() {
            // Arrange
            MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
            BindingResult bindingResult = mock(BindingResult.class);
            FieldError fieldError = new FieldError("object", "username", "must not be empty");

            when(ex.getBindingResult()).thenReturn(bindingResult);
            when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleValidationErrors(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(400);
                assertThat(body.message()).isEqualTo("Validation failed");
                assertThat(body.validationErrors()).containsEntry("username", "must not be empty");
            });
        }

        @Test
        @DisplayName("Should fallback to 'Invalid value' when FieldError default message is null")
        void shouldFallbackToDefaultMessage_WhenFieldErrorHasNullMessage() {
            // Arrange
            MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
            BindingResult bindingResult = mock(BindingResult.class);
            FieldError fieldError = new FieldError("object", "email", null, false, null, null, null);

            when(ex.getBindingResult()).thenReturn(bindingResult);
            when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleValidationErrors(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull().satisfies(body ->
                assertThat(body.validationErrors()).containsEntry("email", "Invalid value"));
        }

        @Test
        @DisplayName("Should map HttpMessageNotReadableException to 400 Bad Request")
        void shouldHandleHttpMessageNotReadable() {
            // Arrange
            HttpMessageNotReadableException ex = mock(HttpMessageNotReadableException.class);
            when(ex.getMessage()).thenReturn("Required request body is missing");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleHttpMessageNotReadable(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(400);
                assertThat(body.message()).isEqualTo("Malformed JSON request or missing request body");
            });
        }

        @Test
        @DisplayName("Should format type mismatch message when required type is known")
        void shouldHandleTypeMismatch_WhenRequiredTypeKnown() {
            // Arrange
            MethodArgumentTypeMismatchException ex = mock(MethodArgumentTypeMismatchException.class);
            when(ex.getName()).thenReturn("id");
            doReturn(Long.class).when(ex).getRequiredType();

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleTypeMismatch(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(400);
                assertThat(body.message()).isEqualTo("Parameter 'id' should be of type 'Long'");
            });
        }

        @Test
        @DisplayName("Should format type mismatch message as 'unknown' when required type is null")
        void shouldHandleTypeMismatch_WhenRequiredTypeNull() {
            // Arrange
            MethodArgumentTypeMismatchException ex = mock(MethodArgumentTypeMismatchException.class);
            when(ex.getName()).thenReturn("param");
            when(ex.getRequiredType()).thenReturn(null);

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleTypeMismatch(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull().satisfies(body ->
                assertThat(body.message()).isEqualTo("Parameter 'param' should be of type 'unknown'"));
        }
    }

    @Nested
    @DisplayName("Rate Limiting, WebSocket, and Fallbacks")
    class SystemExceptionTests {

        @Test
        @DisplayName("Should map RequestNotPermitted to 429 Too Many Requests with Retry-After header")
        void shouldHandleRateLimit() {
            // Arrange
            RequestNotPermitted ex = mock(RequestNotPermitted.class);

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleRateLimit(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
            assertThat(response.getHeaders().getFirst("Retry-After")).isEqualTo("60");
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(429);
                assertThat(body.message()).isEqualTo("Too many requests. Please wait a moment.");
            });
        }

        @Test
        @DisplayName("Should map unhandled Exception to 500 Internal Server Error")
        void shouldHandleGeneralException() {
            // Arrange
            Exception ex = new Exception("Fatal database disconnection");

            // Act
            ResponseEntity<ErrorResponse> response = handler.handleGeneralException(ex, requestMock);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull().satisfies(body -> {
                assertThat(body.status()).isEqualTo(500);
                assertThat(body.message()).isEqualTo("An unexpected error occurred");
            });
        }

        @Test
        @DisplayName("Should return error map with message for WebSocket exception")
        void shouldHandleWebSocketException_WhenMessageIsPresent() {
            // Arrange
            Exception ex = new RuntimeException("Illegal move executed");

            // Act
            Map<String, String> result = handler.handleWebSocketException(ex);

            // Assert
            assertThat(result).containsEntry("error", "Illegal move executed");
        }

        @Test
        @DisplayName("Should fallback to generic message when WebSocket exception message is null or blank")
        void shouldHandleWebSocketException_WhenMessageIsBlank() {
            // Arrange
            Exception exWithNull = new RuntimeException((String) null);
            Exception exWithBlank = new RuntimeException("   ");

            // Act
            Map<String, String> nullResult = handler.handleWebSocketException(exWithNull);
            Map<String, String> blankResult = handler.handleWebSocketException(exWithBlank);

            // Assert
            assertThat(nullResult).containsEntry("error", "An error occurred");
            assertThat(blankResult).containsEntry("error", "An error occurred");
        }
    }
}
