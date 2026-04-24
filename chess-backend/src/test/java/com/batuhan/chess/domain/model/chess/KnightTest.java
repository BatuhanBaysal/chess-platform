package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for Knight piece movement.
 * Validates the unique L-shape movement, jumping capability, and capture rules.
 */
@DisplayName("Knight Piece Logic Tests")
class KnightTest {

    private Board board;
    private final Position centerPos = new Position(4, 4); // e5

    @BeforeEach
    void setUp() {
        board = new Board(false);
    }

    @Nested
    @DisplayName("L-Shape Movement Validation")
    class LShapeMovementTests {

        @Test
        @DisplayName("Should move in a vertical L-shape (2 ranks, 1 file)")
        void shouldMoveVerticalLShape() {
            // Arrange
            Position start = new Position(1, 0); // b1
            Position target = new Position(2, 2); // c3
            Knight knight = new Knight(Color.WHITE, start);
            board.setPieceAt(start, knight);

            // Act
            boolean isLegal = knight.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isLegal).as("Knight should jump in vertical L-shape to c3").isTrue();
        }

        @Test
        @DisplayName("Should move in a horizontal L-shape (1 rank, 2 files)")
        void shouldMoveHorizontalLShape() {
            // Arrange
            Position target = new Position(6, 5); // g6
            Knight knight = new Knight(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, knight);

            // Act
            boolean isLegal = knight.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isLegal).as("Knight should jump in horizontal L-shape to g6").isTrue();
        }

        @Test
        @DisplayName("Should prohibit non-L-shape movements (straight or diagonal)")
        void shouldProhibitInvalidPatterns() {
            // Arrange
            Knight knight = new Knight(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, knight);

            // Act & Assert
            assertThat(knight.isPseudoLegalMove(new Position(4, 6), board)).as("Straight move").isFalse();
            assertThat(knight.isPseudoLegalMove(new Position(6, 6), board)).as("Pure diagonal move").isFalse();
            assertThat(knight.isPseudoLegalMove(centerPos, board)).as("Same square").isFalse();
        }
    }

    @Nested
    @DisplayName("Interaction & Capture Logic")
    class InteractionTests {

        @Test
        @DisplayName("Should capture enemy piece at the destination")
        void shouldCaptureEnemy() {
            // Arrange
            Position target = new Position(5, 6); // f7
            Knight knight = new Knight(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, knight);
            board.setPieceAt(target, new Pawn(Color.BLACK, target));

            // Act
            boolean canCapture = knight.isPseudoLegalMove(target, board);

            // Assert
            assertThat(canCapture).isTrue();
        }

        @Test
        @DisplayName("Should not move to a square occupied by a friendly piece")
        void shouldNotCaptureFriendly() {
            // Arrange
            Position target = new Position(5, 6);
            Knight knight = new Knight(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, knight);
            board.setPieceAt(target, new Rook(Color.WHITE, target));

            // Act
            boolean canMove = knight.isPseudoLegalMove(target, board);

            // Assert
            assertThat(canMove).isFalse();
        }
    }

    @Nested
    @DisplayName("Batch Move Generation (getPseudoLegalMoves)")
    class MoveGenerationTests {

        @Test
        @DisplayName("Should generate all 8 possible L-shapes from a central position")
        void shouldReturnEightMovesFromCenter() {
            // Arrange
            Knight knight = new Knight(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, knight);

            // Act
            List<Position> moves = knight.getPseudoLegalMoves(board);

            // Assert
            assertThat(moves)
                .as("A central knight must have exactly 8 available squares")
                .hasSize(8)
                .containsAll(List.of(
                    new Position(6, 5), new Position(6, 3),
                    new Position(2, 5), new Position(2, 3),
                    new Position(5, 6), new Position(3, 6),
                    new Position(5, 2), new Position(3, 2)
                ));
        }

        @Test
        @DisplayName("Should restrict moves correctly at board boundaries (corners)")
        void shouldHandleCornerBoundaries() {
            // Arrange
            Position corner = new Position(0, 0); // a1
            Knight knight = new Knight(Color.WHITE, corner);
            board.setPieceAt(corner, knight);

            // Act
            List<Position> moves = knight.getPseudoLegalMoves(board);

            // Assert
            assertThat(moves)
                .as("Knight in corner (a1) should only have 2 legal squares (b3, c2)")
                .hasSize(2)
                .containsExactlyInAnyOrder(new Position(1, 2), new Position(2, 1));
        }
    }
}
