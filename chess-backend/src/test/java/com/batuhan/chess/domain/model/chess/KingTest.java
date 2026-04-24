package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for King piece movement and special rules.
 * Validates basic 1-square movement, capturing logic, and castling availability.
 */
@DisplayName("King Piece Logic Tests")
class KingTest {

    private Board board;
    private final Position centerPos = new Position(4, 4); // e5

    @BeforeEach
    void setUp() {
        board = new Board(false);
    }

    @Nested
    @DisplayName("Basic Movement Validation")
    class BasicMovementTests {

        @Test
        @DisplayName("Should move exactly one square in any direction")
        void shouldMoveOneSquareInAnyDirection() {
            // Arrange
            King king = new King(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, king);

            // Act & Assert
            assertThat(king.isPseudoLegalMove(new Position(4, 5), board)).as("Move North").isTrue();
            assertThat(king.isPseudoLegalMove(new Position(5, 5), board)).as("Move North-East").isTrue();
            assertThat(king.isPseudoLegalMove(new Position(3, 4), board)).as("Move West").isTrue();
        }

        @Test
        @DisplayName("Should prohibit moving more than one square (excluding castling)")
        void shouldNotMoveBeyondOneSquare() {
            // Arrange
            King king = new King(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, king);

            // Act
            boolean twoSquaresForward = king.isPseudoLegalMove(new Position(4, 6), board);
            boolean knightJump = king.isPseudoLegalMove(new Position(6, 6), board);

            // Assert
            assertThat(twoSquaresForward).isFalse();
            assertThat(knightJump).isFalse();
        }

        @Test
        @DisplayName("Should return false when moving to the same square")
        void shouldReturnFalseForSameSquare() {
            // Arrange
            King king = new King(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, king);

            // Act
            boolean isLegal = king.isPseudoLegalMove(centerPos, board);

            // Assert
            assertThat(isLegal).isFalse();
        }
    }

    @Nested
    @DisplayName("Interaction & Capture Tests")
    class InteractionTests {

        @Test
        @DisplayName("Should allow capturing an enemy piece")
        void shouldCaptureEnemy() {
            // Arrange
            Position target = new Position(4, 5);
            King king = new King(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, king);
            board.setPieceAt(target, new Pawn(Color.BLACK, target));

            // Act
            boolean canCapture = king.isPseudoLegalMove(target, board);

            // Assert
            assertThat(canCapture).isTrue();
        }

        @Test
        @DisplayName("Should prohibit moving to a square occupied by a friendly piece")
        void shouldNotCaptureFriendly() {
            // Arrange
            Position target = new Position(4, 5);
            King king = new King(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, king);
            board.setPieceAt(target, new Rook(Color.WHITE, target));

            // Act
            boolean canMove = king.isPseudoLegalMove(target, board);

            // Assert
            assertThat(canMove).isFalse();
        }
    }

    @Nested
    @DisplayName("Castling Availability Tests")
    class CastlingTests {

        @Test
        @DisplayName("Should allow castling attempts if king has not moved yet")
        void shouldAllowCastlingAttempt() {
            // Arrange
            Position start = new Position(4, 0); // e1
            King king = new King(Color.WHITE, start);
            board.setPieceAt(start, king);

            // Act
            boolean kingSide = king.isPseudoLegalMove(new Position(6, 0), board);
            boolean queenSide = king.isPseudoLegalMove(new Position(2, 0), board);

            // Assert
            assertThat(kingSide).as("King-side castling attempt (g1)").isTrue();
            assertThat(queenSide).as("Queen-side castling attempt (c1)").isTrue();
        }

        @Test
        @DisplayName("Should prohibit castling if king has already moved")
        void shouldProhibitCastlingAfterMove() {
            // Arrange
            Position start = new Position(4, 0);
            King king = new King(Color.WHITE, start);
            king.setHasMoved(true); // Key condition
            board.setPieceAt(start, king);

            // Act
            boolean castlingAttempt = king.isPseudoLegalMove(new Position(6, 0), board);

            // Assert
            assertThat(castlingAttempt).isFalse();
        }
    }

    @Nested
    @DisplayName("Move Generation (getPseudoLegalMoves)")
    class MoveGenerationTests {

        @Test
        @DisplayName("Should handle board boundaries correctly in corners")
        void shouldHandleCornerBoundaries() {
            // Arrange
            Position corner = new Position(0, 0); // a1
            King king = new King(Color.WHITE, corner);
            king.setHasMoved(true);
            board.setPieceAt(corner, king);

            // Act
            List<Position> moves = king.getPseudoLegalMoves(board);

            // Assert
            assertThat(moves)
                .as("King in corner should only have 3 available squares")
                .hasSize(3)
                .containsExactlyInAnyOrder(
                    new Position(0, 1),
                    new Position(1, 1),
                    new Position(1, 0)
                );
        }
    }
}
