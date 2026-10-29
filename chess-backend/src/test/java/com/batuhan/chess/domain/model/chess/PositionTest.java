package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DisplayName("Position Value Object Tests")
class PositionTest {

    @Nested
    @DisplayName("Coordinate Validation")
    class CoordinateValidationTests {

        @ParameterizedTest(name = "File: {0}, Rank: {1} should be rejected")
        @CsvSource({
            "-1, 0",
            "8, 0",
            "0, -1",
            "0, 8",
            "10, 10"
        })
        @DisplayName("Should throw IllegalArgumentException when coordinates are out of bounds")
        void shouldThrowException_WhenCoordinatesOutOfBounds(int file, int rank) {
            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> new Position(file, rank));
        }

        @ParameterizedTest(name = "File: {0}, Rank: {1} should be accepted")
        @CsvSource({
            "0, 0",
            "7, 7",
            "0, 7",
            "7, 0",
            "4, 4"
        })
        @DisplayName("Should instantiate successfully when coordinates are valid")
        void shouldInstantiate_WhenCoordinatesAreValid(int file, int rank) {
            // Act
            Position position = new Position(file, rank);

            // Assert
            assertThat(position.file()).isEqualTo(file);
            assertThat(position.rank()).isEqualTo(rank);
        }
    }

    @Nested
    @DisplayName("Static Validator & Notation")
    class StaticValidatorAndNotationTests {

        @ParameterizedTest(name = "Position({0}, {1}) valid? {2}")
        @CsvSource({
            "0, 0, true",
            "7, 7, true",
            "-1, 0, false",
            "8, 0, false",
            "0, 8, false"
        })
        @DisplayName("Should verify coordinate validity via static method")
        void shouldVerifyValidity_ViaStaticMethod(int file, int rank, boolean expected) {
            // Act
            boolean result = Position.isValidPosition(file, rank);

            // Assert
            assertThat(result).isEqualTo(expected);
        }

        @ParameterizedTest(name = "Position({0}, {1}) -> \"{2}\"")
        @CsvSource({
            "0, 0, a1",
            "4, 3, e4",
            "7, 7, h8",
            "3, 6, d7"
        })
        @DisplayName("Should return algebraic chess notation when toString is called")
        void shouldReturnAlgebraicNotation_WhenToStringCalled(int file, int rank, String expectedNotation) {
            // Arrange
            Position position = new Position(file, rank);

            // Act
            String notation = position.toString();

            // Assert
            assertThat(notation).isEqualTo(expectedNotation);
        }

        @Test
        @DisplayName("Should verify equality contract for same and different coordinates")
        void shouldVerifyEqualityContract() {
            // Arrange
            Position pos1 = new Position(3, 3);
            Position pos2 = new Position(3, 3);
            Position pos3 = new Position(4, 4);

            // Act & Assert
            assertThat(pos1)
                .isEqualTo(pos2)
                .hasSameHashCodeAs(pos2)
                .isNotEqualTo(pos3);
        }
    }
}
