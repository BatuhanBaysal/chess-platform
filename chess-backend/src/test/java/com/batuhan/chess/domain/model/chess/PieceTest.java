package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the abstract Piece class behavior.
 * Validates path clearing logic, position state management, and equality contracts.
 */
@DisplayName("Base Piece Domain Logic Tests")
class PieceTest {

    private Board board;

    @BeforeEach
    void setUp() {
        board = new Board(false);
    }

    @Nested
    @DisplayName("Path Obstruction Logic")
    class PathClearingTests {

        @Test
        @DisplayName("Should return true when the trajectory between start and target is empty")
        void shouldReturnTrueWhenPathIsClear() {
            // Arrange
            Position start = new Position(0, 0); // a1
            Position target = new Position(0, 5); // a6
            Piece queen = new Queen(Color.WHITE, start);
            board.setPieceAt(start, queen);

            // Act
            boolean isPathClear = queen.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isPathClear).as("Path should be clear for sliding pieces when empty").isTrue();
        }

        @Test
        @DisplayName("Should return false when another piece blocks the movement path")
        void shouldReturnFalseWhenPathIsBlocked() {
            // Arrange
            Position start = new Position(0, 0);
            Position blocker = new Position(0, 2); // Blocking the file
            Position target = new Position(0, 4);

            Piece queen = new Queen(Color.WHITE, start);
            Piece pawn = new Pawn(Color.WHITE, blocker);

            board.setPieceAt(start, queen);
            board.setPieceAt(blocker, pawn);

            // Act
            boolean isPathClear = queen.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isPathClear).as("A piece at %s should block the queen's path", blocker).isFalse();
        }
    }

    @Nested
    @DisplayName("Position & State Management")
    class StateTests {

        @Test
        @DisplayName("setPosition: should update coordinates and mark the piece as moved")
        void shouldUpdateHasMovedOnSetPosition() {
            // Arrange
            Position start = new Position(0, 0);
            Position target = new Position(1, 1);
            Piece queen = new Queen(Color.WHITE, start);

            // Act
            queen.setPosition(target);

            // Assert
            assertThat(queen.getPosition()).isEqualTo(target);
            assertThat(queen.hasMoved()).as("Piece should track its move history").isTrue();
        }

        @Test
        @DisplayName("updatePositionWithoutMoving: should update coordinates silently (no move history)")
        void shouldMaintainHasMovedFalseDuringSilentUpdate() {
            // Arrange
            Position start = new Position(0, 0);
            Position target = new Position(1, 1);
            Piece queen = new Queen(Color.WHITE, start);

            // Act
            queen.updatePositionWithoutMoving(target);

            // Assert
            assertThat(queen.getPosition()).isEqualTo(target);
            assertThat(queen.hasMoved()).as("Move history should remain untouched").isFalse();
        }
    }

    @Nested
    @DisplayName("Equality & Identity")
    class IdentityTests {

        @Test
        @DisplayName("Equals/HashCode: should verify equality based on Type and Color only")
        void shouldVerifyEqualityContract() {
            // Arrange
            Piece queen1 = new Queen(Color.WHITE, new Position(0, 0));
            Piece queen2 = new Queen(Color.WHITE, new Position(7, 7)); // Different position
            Piece blackQueen = new Queen(Color.BLACK, new Position(0, 0));

            // Assert
            assertThat(queen1)
                .as("Pieces with same color and type should be equal regardless of position")
                .isEqualTo(queen2)
                .isNotEqualTo(blackQueen)
                .hasSameHashCodeAs(queen2);
        }

        @Test
        @DisplayName("getSymbol: should return uppercase char representation from PieceType")
        void shouldReturnCorrectSymbolChar() {
            // Arrange
            Piece queen = new Queen(Color.WHITE, new Position(0, 0));

            // Act
            char symbol = queen.getType().getSymbol();

            // Assert
            assertThat(symbol).isEqualTo('Q');
        }
    }
}
