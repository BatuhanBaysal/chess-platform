package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("PieceType Enum Logic Tests")
class PieceTypeTest {

    @ParameterizedTest(name = "PieceType {0} should have symbol '{1}'")
    @CsvSource({
        "PAWN, P",
        "KNIGHT, N",
        "BISHOP, B",
        "ROOK, R",
        "QUEEN, Q",
        "KING, K"
    })
    @DisplayName("Should return correct character symbol for each piece type")
    void shouldReturnCorrectSymbol(PieceType type, char expectedSymbol) {
        // Act & Assert
        assertThat(type.getSymbol()).isEqualTo(expectedSymbol);
    }

    @ParameterizedTest
    @EnumSource(PieceType.class)
    @DisplayName("Should contain all standard chess piece types")
    void shouldContainAllPieceTypes(PieceType type) {
        // Act & Assert
        assertThat(PieceType.valueOf(type.name())).isEqualTo(type);
    }
}
