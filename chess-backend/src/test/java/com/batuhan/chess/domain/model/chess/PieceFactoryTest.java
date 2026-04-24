package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Technical test suite for PieceFactory.
 * Validates the instantiation of chess pieces and promotion logic handling.
 */
@DisplayName("PieceFactory Technical Test Suite")
class PieceFactoryTest {

    private final Position defaultPos = new Position(0, 0);

    @Test
    @DisplayName("Should protect Utility Class from reflection-based instantiation")
    void shouldThrowExceptionOnReflection() throws Exception {
        // Arrange
        Constructor<PieceFactory> constructor = PieceFactory.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        // Act & Assert
        InvocationTargetException exception = assertThrows(InvocationTargetException.class, constructor::newInstance);

        assertThat(exception.getCause())
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("Utility class");
    }

    @Nested
    @DisplayName("Direct Type Creation")
    class PieceCreationTests {

        @ParameterizedTest
        @EnumSource(PieceType.class)
        @DisplayName("Should map each PieceType to its corresponding concrete class and properties")
        void shouldCreateCorrectPieceForEveryEnum(PieceType type) {
            // Arrange
            Color color = Color.WHITE;

            // Act
            Piece piece = PieceFactory.createPiece(type, color, defaultPos);

            // Assert
            assertThat(piece).isNotNull();
            assertThat(piece.getType()).isEqualTo(type);
            assertThat(piece.getColor()).isEqualTo(color);
            assertThat(piece.getPosition()).isEqualTo(defaultPos);
        }

        @Test
        @DisplayName("Should verify specific concrete class implementation for each type")
        void shouldInstantiateCorrectConcreteClasses() {
            // Act & Assert
            assertThat(PieceFactory.createPiece(PieceType.PAWN, Color.WHITE, defaultPos)).isExactlyInstanceOf(Pawn.class);
            assertThat(PieceFactory.createPiece(PieceType.KNIGHT, Color.WHITE, defaultPos)).isExactlyInstanceOf(Knight.class);
            assertThat(PieceFactory.createPiece(PieceType.BISHOP, Color.WHITE, defaultPos)).isExactlyInstanceOf(Bishop.class);
            assertThat(PieceFactory.createPiece(PieceType.ROOK, Color.WHITE, defaultPos)).isExactlyInstanceOf(Rook.class);
            assertThat(PieceFactory.createPiece(PieceType.QUEEN, Color.WHITE, defaultPos)).isExactlyInstanceOf(Queen.class);
            assertThat(PieceFactory.createPiece(PieceType.KING, Color.WHITE, defaultPos)).isExactlyInstanceOf(King.class);
        }
    }

    @Nested
    @DisplayName("Promotion & Input Sanitization")
    class PromotionLogicTests {

        @ParameterizedTest
        @ValueSource(strings = {"ROOK", "bishop", "  knight  "})
        @DisplayName("Should handle various string formats and case-insensitivity for promotion")
        void shouldHandleSanitizedInputForPromotion(String typeStr) {
            // Arrange
            Color color = Color.BLACK;

            // Act
            Piece piece = PieceFactory.createPromotedPiece(typeStr, color, defaultPos);

            // Assert
            assertThat(piece).isNotNull();
            assertThat(piece.getType().name()).isEqualTo(typeStr.trim().toUpperCase(Locale.ROOT));
        }

        @ParameterizedTest
        @ValueSource(strings = {"INVALID", "KING", "", "   "})
        @DisplayName("Should default to QUEEN for invalid, null, or prohibited (King) promotion inputs")
        void shouldDefaultToQueenForInvalidInput(String invalidInput) {
            // Act
            Piece piece = PieceFactory.createPromotedPiece(invalidInput, Color.WHITE, defaultPos);

            // Assert
            assertThat(piece)
                .as("Factory should fallback to Queen for input: %s", invalidInput)
                .isExactlyInstanceOf(Queen.class);
        }

        @Test
        @DisplayName("Should handle null input by defaulting to Queen")
        void shouldHandleNullInput() {
            // Act
            Piece piece = PieceFactory.createPromotedPiece(null, Color.WHITE, defaultPos);

            // Assert
            assertThat(piece).isExactlyInstanceOf(Queen.class);
        }
    }
}
