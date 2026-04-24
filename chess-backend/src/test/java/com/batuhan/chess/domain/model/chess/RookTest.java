package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for Rook piece movement logic.
 * Validates horizontal/vertical sliding, path obstruction, and capture rules.
 */
@DisplayName("Rook Movement Logic Tests")
class RookTest {

    private Board board;
    private final Position centerPos = new Position(3, 3); // d4

    @BeforeEach
    void setUp() {
        board = new Board(false);
    }

    @Nested
    @DisplayName("Directional Movement Validation")
    class DirectionalTests {

        @Test
        @DisplayName("Should move horizontally and vertically on an empty board")
        void shouldAllowBasicStraightMoves() {
            // Arrange
            Rook rook = new Rook(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, rook);

            // Act & Assert
            assertThat(rook.isPseudoLegalMove(new Position(7, 3), board)).as("Move Right (h4)").isTrue();
            assertThat(rook.isPseudoLegalMove(new Position(0, 3), board)).as("Move Left (a4)").isTrue();
            assertThat(rook.isPseudoLegalMove(new Position(3, 7), board)).as("Move Up (d8)").isTrue();
            assertThat(rook.isPseudoLegalMove(new Position(3, 0), board)).as("Move Down (d1)").isTrue();
        }

        @Test
        @DisplayName("Should prohibit non-straight movements (diagonals or knight jumps)")
        void shouldRejectInvalidDirections() {
            // Arrange
            Rook rook = new Rook(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, rook);

            // Act & Assert
            assertThat(rook.isPseudoLegalMove(new Position(4, 4), board)).as("Diagonal move").isFalse();
            assertThat(rook.isPseudoLegalMove(new Position(5, 4), board)).as("Knight-style jump").isFalse();
        }
    }

    @Nested
    @DisplayName("Obstruction & Capture Logic")
    class InteractionTests {

        @Test
        @DisplayName("Should be blocked by any piece on its path and cannot jump")
        void shouldBeBlockedByPiecesOnPath() {
            // Arrange
            Position start = new Position(0, 0); // a1
            Position blocker = new Position(0, 3); // a4 (Blocker)
            Position target = new Position(0, 5);  // a6

            Rook rook = new Rook(Color.WHITE, start);
            board.setPieceAt(start, rook);
            board.setPieceAt(blocker, new Pawn(Color.WHITE, blocker));

            // Act
            boolean canReachTarget = rook.isPseudoLegalMove(target, board);
            boolean canReachBlocker = rook.isPseudoLegalMove(blocker, board);

            // Assert
            assertThat(canReachTarget).as("Rook cannot jump over the blocker at a4").isFalse();
            assertThat(canReachBlocker).as("Rook cannot move to a square with a friendly piece").isFalse();
        }

        @Test
        @DisplayName("Should allow capturing enemy pieces but reject friendly squares")
        void shouldHandleCaptureLogicCorrectly() {
            // Arrange
            Position start = new Position(0, 0); // a1
            Position enemyPos = new Position(0, 4); // a5
            Position friendPos = new Position(4, 0); // e1

            Rook rook = new Rook(Color.WHITE, start);
            board.setPieceAt(start, rook);
            board.setPieceAt(enemyPos, new Pawn(Color.BLACK, enemyPos));
            board.setPieceAt(friendPos, new Pawn(Color.WHITE, friendPos));

            // Act & Assert
            assertThat(rook.isPseudoLegalMove(enemyPos, board)).as("Can capture enemy").isTrue();
            assertThat(rook.isPseudoLegalMove(friendPos, board)).as("Cannot occupy friendly square").isFalse();
        }
    }

    @Nested
    @DisplayName("Batch Move Generation")
    class MoveGenerationTests {

        @Test
        @DisplayName("Should collect all legal moves until it hits a piece or board boundary")
        void shouldCollectMovesUntilBlocked() {
            // Arrange
            Position start = new Position(0, 0); // a1
            Rook rook = new Rook(Color.WHITE, start);
            board.setPieceAt(start, rook);

            // Vertical block: enemy at a3
            Position enemyPos = new Position(0, 2);
            board.setPieceAt(enemyPos, new Pawn(Color.BLACK, enemyPos));

            // Horizontal block: friend at c1
            Position friendPos = new Position(2, 0);
            board.setPieceAt(friendPos, new Pawn(Color.WHITE, friendPos));

            // Act
            List<Position> moves = rook.getPseudoLegalMoves(board);

            // Assert
            assertThat(moves)
                .as("Moves should include the enemy square but not the friendly square or squares beyond")
                .hasSize(3)
                .containsExactlyInAnyOrder(
                    new Position(0, 1),
                    new Position(0, 2),
                    new Position(1, 0)
                );
        }
    }
}
