package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Rook Movement Logic Tests")
class RookTest {

    private Board board;
    private final Position centerPos = new Position(3, 3);

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
            Position rightPos = new Position(7, 3);
            Position leftPos = new Position(0, 3);
            Position upPos = new Position(3, 7);
            Position downPos = new Position(3, 0);

            // Act
            boolean canMoveRight = rook.isPseudoLegalMove(rightPos, board);
            boolean canMoveLeft = rook.isPseudoLegalMove(leftPos, board);
            boolean canMoveUp = rook.isPseudoLegalMove(upPos, board);
            boolean canMoveDown = rook.isPseudoLegalMove(downPos, board);

            // Assert
            assertThat(canMoveRight).as("Move Right (h4)").isTrue();
            assertThat(canMoveLeft).as("Move Left (a4)").isTrue();
            assertThat(canMoveUp).as("Move Up (d8)").isTrue();
            assertThat(canMoveDown).as("Move Down (d1)").isTrue();
        }

        @Test
        @DisplayName("Should prohibit non-straight movements (diagonals or knight jumps)")
        void shouldRejectInvalidDirections() {
            // Arrange
            Rook rook = new Rook(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, rook);
            Position diagonalPos = new Position(4, 4);
            Position knightPos = new Position(5, 4);

            // Act
            boolean isDiagonal = rook.isPseudoLegalMove(diagonalPos, board);
            boolean isKnightJump = rook.isPseudoLegalMove(knightPos, board);

            // Assert
            assertThat(isDiagonal).as("Diagonal move").isFalse();
            assertThat(isKnightJump).as("Knight-style jump").isFalse();
        }
    }

    @Nested
    @DisplayName("Obstruction & Capture Logic")
    class InteractionTests {

        @Test
        @DisplayName("Should be blocked by any piece on its path and cannot jump")
        void shouldBeBlockedByPiecesOnPath() {
            // Arrange
            Position start = new Position(0, 0);
            Position blocker = new Position(0, 3);
            Position target = new Position(0, 5);
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
            Position start = new Position(0, 0);
            Position enemyPos = new Position(0, 4);
            Position friendPos = new Position(4, 0);
            Rook rook = new Rook(Color.WHITE, start);
            board.setPieceAt(start, rook);
            board.setPieceAt(enemyPos, new Pawn(Color.BLACK, enemyPos));
            board.setPieceAt(friendPos, new Pawn(Color.WHITE, friendPos));

            // Act
            boolean canCapture = rook.isPseudoLegalMove(enemyPos, board);
            boolean canOccupyFriend = rook.isPseudoLegalMove(friendPos, board);

            // Assert
            assertThat(canCapture).as("Can capture enemy").isTrue();
            assertThat(canOccupyFriend).as("Cannot occupy friendly square").isFalse();
        }
    }

    @Nested
    @DisplayName("Batch Move Generation")
    class MoveGenerationTests {

        @Test
        @DisplayName("Should collect all legal moves until it hits a piece or board boundary")
        void shouldCollectMovesUntilBlocked() {
            // Arrange
            Position start = new Position(0, 0);
            Rook rook = new Rook(Color.WHITE, start);
            board.setPieceAt(start, rook);

            Position enemyPos = new Position(0, 2);
            board.setPieceAt(enemyPos, new Pawn(Color.BLACK, enemyPos));

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
