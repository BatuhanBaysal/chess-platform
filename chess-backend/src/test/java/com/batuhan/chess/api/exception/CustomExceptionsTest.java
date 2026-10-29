package com.batuhan.chess.api.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Custom Exceptions Unit Tests")
class CustomExceptionsTest {

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("Should instantiate AccountDeactivatedException with message")
        void shouldInstantiateAccountDeactivatedException() {
            // Arrange & Act
            AccountDeactivatedException ex = new AccountDeactivatedException("Account deactivated");

            // Assert
            assertThat(ex.getMessage()).isEqualTo("Account deactivated");
        }

        @Test
        @DisplayName("Should instantiate EmailAlreadyExistsException with message")
        void shouldInstantiateEmailAlreadyExistsException() {
            // Arrange & Act
            EmailAlreadyExistsException ex = new EmailAlreadyExistsException("Email exists");

            // Assert
            assertThat(ex.getMessage()).isEqualTo("Email exists");
        }

        @Test
        @DisplayName("Should instantiate UserAlreadyExistsException with message")
        void shouldInstantiateUserAlreadyExistsException() {
            // Arrange & Act
            UserAlreadyExistsException ex = new UserAlreadyExistsException("User exists");

            // Assert
            assertThat(ex.getMessage()).isEqualTo("User exists");
        }

        @Test
        @DisplayName("Should instantiate ResourceNotFoundException with message")
        void shouldInstantiateResourceNotFoundException() {
            // Arrange & Act
            ResourceNotFoundException ex = new ResourceNotFoundException("Not found");

            // Assert
            assertThat(ex.getMessage()).isEqualTo("Not found");
        }

        @Test
        @DisplayName("Should instantiate GameOperationException with message and cause")
        void shouldInstantiateGameOperationException() {
            // Arrange
            Throwable cause = new IllegalArgumentException("Root cause");

            // Act
            GameOperationException exWithMessage = new GameOperationException("Operation failed");
            GameOperationException exWithCause = new GameOperationException("Operation failed with cause", cause);

            // Assert
            assertThat(exWithMessage.getMessage()).isEqualTo("Operation failed");
            assertThat(exWithCause.getMessage()).isEqualTo("Operation failed with cause");
            assertThat(exWithCause.getCause()).isEqualTo(cause);
        }

        @Test
        @DisplayName("Should instantiate StockfishEngineException with message and cause")
        void shouldInstantiateStockfishEngineException() {
            // Arrange
            Throwable cause = new RuntimeException("Process failure");

            // Act
            StockfishEngineException exWithMessage = new StockfishEngineException("Engine crash");
            StockfishEngineException exWithCause = new StockfishEngineException("Engine crash with cause", cause);

            // Assert
            assertThat(exWithMessage.getMessage()).isEqualTo("Engine crash");
            assertThat(exWithCause.getMessage()).isEqualTo("Engine crash with cause");
            assertThat(exWithCause.getCause()).isEqualTo(cause);
        }
    }
}
