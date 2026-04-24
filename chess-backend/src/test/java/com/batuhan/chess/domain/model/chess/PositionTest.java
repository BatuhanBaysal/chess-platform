package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Unit tests for Position record.
 * Ensures coordinate validation (0-7) and equality logic for board indices.
 */
@DisplayName("Position Value Object Tests")
class PositionTest {

    @Nested
    @DisplayName("Coordinate Validation")
    class ValidationTests {

        @ParameterizedTest(name = "File: {0}, Rank: {1} should be rejected")
        @CsvSource({
            "-1, 0",
            "8, 0",
            "0, -1",
            "0, 8",
            "10, 10"
        })
        @DisplayName("Should throw IllegalArgumentException for out-of-bounds coordinates")
        void shouldThrowExceptionForInvalidCoordinates(int file, int rank) {
            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> new Position(file, rank),
                "Position must reject coordinates outside 0-7 range");
        }

        @ParameterizedTest(name = "File: {0}, Rank: {1} should be accepted")
        @CsvSource({
            "0, 0",
            "7, 7",
            "0, 7",
            "7, 0",
            "4, 4"
        })
        @DisplayName("Should successfully instantiate for valid boundary coordinates")
        void shouldAcceptValidCoordinates(int file, int rank) {
            // Act
            Position position = new Position(file, rank);

            // Assert
            assertThat(position.file()).as("File coordinate match").isEqualTo(file);
            assertThat(position.rank()).as("Rank coordinate match").isEqualTo(rank);
        }
    }

    @Nested
    @DisplayName("Utility Logic & Equality")
    class UtilityTests {

        @ParameterizedTest(name = "Position({0}, {1}) valid? {2}")
        @CsvSource({
            "0, 0, true",
            "7, 7, true",
            "-1, 0, false",
            "8, 0, false",
            "0, 8, false"
        })
        @DisplayName("isValidPosition: should return correct boolean status without instantiation")
        void shouldVerifyStaticValidityMethod(int file, int rank, boolean expected) {
            // Act
            boolean result = Position.isValidPosition(file, rank);

            // Assert
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("Should verify that positions with different coordinates are not equal")
        void shouldNotBeEqualForDifferentCoordinates() {
            // Arrange
            Position pos1 = new Position(3, 3);
            Position pos2 = new Position(4, 4);

            // Act & Assert
            assertThat(pos1)
                .isNotEqualTo(pos2)
                .hasSameHashCodeAs(new Position(3, 3));
        }
    }
}
