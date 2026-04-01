package com.batuhan.chess.identity.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class PositionTest {

    @ParameterizedTest
    @CsvSource({
        "-1, 0",
        "8, 0",
        "0, -1",
        "0, 8",
        "10, 10"
    })
    @DisplayName("Invalid coordinates should throw an IllegalArgumentException.")
    void shouldThrowExceptionForInvalidCoordinates(int file, int rank) {
        // Act & Assert
        // We verify both the exception type and the fact that it occurred during instantiation.
        assertThrows(IllegalArgumentException.class, () -> new Position(file, rank));
    }

    @ParameterizedTest
    @CsvSource({
        "0, 0",
        "7, 7",
        "0, 7",
        "7, 0",
        "4, 4"
    })
    @DisplayName("Valid boundary coordinates should be accepted.")
    void shouldAcceptValidCoordinates(int file, int rank) {
        // Act
        Position position = new Position(file, rank);

        // Assert
        assertThat(position.file()).isEqualTo(file);
        assertThat(position.rank()).isEqualTo(rank);
    }

    @Test
    @DisplayName("Position objects with different coordinates should not be equal.")
    void positionsWithDifferentCoordinatesShouldNotBeEqual() {
        // Arrange
        Position pos1 = new Position(3, 3);
        Position pos2 = new Position(4, 4);

        // Act & Assert
        assertThat(pos1).isNotEqualTo(pos2);
    }

    @ParameterizedTest
    @CsvSource({
        "0, 0, true",
        "7, 7, true",
        "-1, 0, false",
        "8, 0, false",
        "0, 8, false"
    })
    @DisplayName("isValidPosition static method should return correct boolean results.")
    void isValidPositionShouldReturnCorrectResults(int file, int rank, boolean expected) {
        // Act
        boolean result = Position.isValidPosition(file, rank);

        // Assert
        assertThat(result).isEqualTo(expected);
    }
}
