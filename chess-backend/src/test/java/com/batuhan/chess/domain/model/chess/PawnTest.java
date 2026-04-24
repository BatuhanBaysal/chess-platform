package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for Pawn movement logic.
 * Covers forward moves, initial double-step, diagonal captures, and path blocking.
 */
@DisplayName("Pawn Domain Model Unit Tests")
class PawnTest {

    private Board board;

    @BeforeEach
    void setUp() {
        board = new Board(false);
    }

    @Nested
    @DisplayName("Forward Movement")
    class ForwardMovementTests {

        @ParameterizedTest(name = "{0} pawn from {1},{2} to {3},{4}")
        @CsvSource({
            "WHITE, 0, 1, 0, 2", // White a2 -> a3
            "BLACK, 0, 6, 0, 5", // Black a7 -> a6
            "WHITE, 4, 1, 4, 3", // White e2 -> e4 (Initial double step)
            "BLACK, 4, 6, 4, 4"  // Black e7 -> e5 (Initial double step)
        })
        @DisplayName("Pawn should move forward correctly according to its color and starting rank")
        void shouldMoveForwardCorrectly(Color color, int startFile, int startRank, int targetFile, int targetRank) {
            // Arrange
            Position start = new Position(startFile, startRank);
            Position target = new Position(targetFile, targetRank);
            Pawn pawn = new Pawn(color, start);
            board.setPieceAt(start, pawn);

            // Act
            boolean isLegal = pawn.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isLegal).isTrue();
        }

        @Test
        @DisplayName("Pawn should not move forward if the destination is occupied")
        void shouldNotMoveToOccupiedSquare() {
            // Arrange
            Position start = new Position(0, 1);
            Position target = new Position(0, 2);
            Pawn pawn = new Pawn(Color.WHITE, start);
            board.setPieceAt(start, pawn);
            board.setPieceAt(target, new Rook(Color.BLACK, target)); // Blocker

            // Act
            boolean isLegal = pawn.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isLegal).as("Pawns cannot capture forward").isFalse();
        }

        @Test
        @DisplayName("Pawn should not jump over a piece during its initial two-square move")
        void shouldNotJumpOverPiece() {
            // Arrange
            Position start = new Position(4, 1);
            Position blocker = new Position(4, 2);
            Position target = new Position(4, 3);
            Pawn pawn = new Pawn(Color.WHITE, start);
            board.setPieceAt(start, pawn);
            board.setPieceAt(blocker, new Knight(Color.BLACK, blocker));

            // Act
            boolean isLegal = pawn.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isLegal).isFalse();
        }
    }

    @Nested
    @DisplayName("Diagonal Capture & Rules")
    class CaptureTests {

        @Test
        @DisplayName("Pawn should capture an enemy piece diagonally")
        void shouldCaptureDiagonally() {
            // Arrange
            Position start = new Position(3, 1); // d2
            Position target = new Position(4, 2); // e3
            Pawn pawn = new Pawn(Color.WHITE, start);
            board.setPieceAt(start, pawn);
            board.setPieceAt(target, new Knight(Color.BLACK, target));

            // Act
            boolean isLegal = pawn.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isLegal).isTrue();
        }

        @Test
        @DisplayName("Pawn should allow diagonal move to empty square for En Passant potential")
        void shouldAllowDiagonalMoveToEmptySquare() {
            // Arrange
            Position start = new Position(3, 1);
            Position target = new Position(4, 2);
            Pawn pawn = new Pawn(Color.WHITE, start);
            board.setPieceAt(start, pawn);

            // Act & Assert
            assertThat(pawn.isPseudoLegalMove(target, board))
                .as("Diagonal move is pseudo-legal even if empty for En Passant logic")
                .isTrue();
        }

        @Test
        @DisplayName("Pawn should not capture its own piece diagonally")
        void shouldNotCaptureFriendlyPiece() {
            // Arrange
            Position start = new Position(3, 1);
            Position target = new Position(4, 2);
            Pawn pawn = new Pawn(Color.WHITE, start);
            board.setPieceAt(start, pawn);
            board.setPieceAt(target, new Bishop(Color.WHITE, target));

            // Act
            boolean isLegal = pawn.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isLegal).isFalse();
        }
    }

    @Nested
    @DisplayName("Directional Constraints")
    class ConstraintTests {

        @Test
        @DisplayName("Pawn should never move backwards")
        void shouldNotMoveBackwards() {
            // Arrange
            Position start = new Position(4, 3);
            Position target = new Position(4, 2); // Moving back
            Pawn pawn = new Pawn(Color.WHITE, start);
            board.setPieceAt(start, pawn);

            // Act & Assert
            assertThat(pawn.isPseudoLegalMove(target, board)).isFalse();
        }

        @Test
        @DisplayName("Pawn should not move 2 squares if it has already left its starting rank")
        void shouldNotMoveTwoSquaresFromMiddleBoard() {
            // Arrange
            Position start = new Position(4, 2); // e3
            Position target = new Position(4, 4); // e5
            Pawn pawn = new Pawn(Color.WHITE, start);
            board.setPieceAt(start, pawn);

            // Act & Assert
            assertThat(pawn.isPseudoLegalMove(target, board)).isFalse();
        }
    }
}
