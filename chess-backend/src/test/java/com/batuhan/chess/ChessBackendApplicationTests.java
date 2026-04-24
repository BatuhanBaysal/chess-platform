package com.batuhan.chess;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Application Entry Point and Context Tests")
class ChessBackendApplicationTests {

    @Test
    @DisplayName("Should load the application context successfully")
    void contextLoads() {
        // Assert
        assertDoesNotThrow(() -> {}, "Context should load without exceptions");
    }

    @Test
    @DisplayName("Should execute main method without throwing exceptions")
    @DirtiesContext
    void main_ShouldRunSuccessfully() {
        // Arrange
        String[] args = {"--server.port=0"};

        // Act & Assert
        assertDoesNotThrow(() -> ChessBackendApplication.main(args));
    }
}
