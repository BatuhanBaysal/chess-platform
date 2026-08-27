package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Queen Piece Logic Tests")
class QueenTest {

    private Board board;
    private final Position centerPos = new Position(3, 3);

    @BeforeEach
    void setUp() {
        board = new Board(false);
    }

    @Nested
    @DisplayName("8-Directional Movement Validation")
    class DirectionalTests {

        @Test
        @DisplayName("Should move in all 8 cardinal and ordinal directions")
        void shouldMoveInAllDirections() {
            // Arrange
            Queen queen = new Queen(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, queen);
            Position north = new Position(3, 7);
            Position south = new Position(3, 0);
            Position east = new Position(7, 3);
            Position west = new Position(0, 3);
            Position northEast = new Position(7, 7);
            Position southWest = new Position(0, 0);
            Position northWest = new Position(0, 6);
            Position southEast = new Position(6, 0);

            // Act
            boolean canMoveNorth = queen.isPseudoLegalMove(north, board);
            boolean canMoveSouth = queen.isPseudoLegalMove(south, board);
            boolean canMoveEast = queen.isPseudoLegalMove(east, board);
            boolean canMoveWest = queen.isPseudoLegalMove(west, board);
            boolean canMoveNorthEast = queen.isPseudoLegalMove(northEast, board);
            boolean canMoveSouthWest = queen.isPseudoLegalMove(southWest, board);
            boolean canMoveNorthWest = queen.isPseudoLegalMove(northWest, board);
            boolean canMoveSouthEast = queen.isPseudoLegalMove(southEast, board);

            // Assert
            assertThat(canMoveNorth).as("North").isTrue();
            assertThat(canMoveSouth).as("South").isTrue();
            assertThat(canMoveEast).as("East").isTrue();
            assertThat(canMoveWest).as("West").isTrue();
            assertThat(canMoveNorthEast).as("North-East").isTrue();
            assertThat(canMoveSouthWest).as("South-West").isTrue();
            assertThat(canMoveNorthWest).as("North-West").isTrue();
            assertThat(canMoveSouthEast).as("South-East").isTrue();
        }

        @Test
        @DisplayName("Should prohibit irregular movement (e.g., Knight L-shape)")
        void shouldNotMoveLikeKnight() {
            // Arrange
            Queen queen = new Queen(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, queen);
            Position knightPos = new Position(4, 5);

            // Act
            boolean knightMove = queen.isPseudoLegalMove(knightPos, board);

            // Assert
            assertThat(knightMove).as("Queen cannot perform L-shaped moves").isFalse();
        }

        @Test
        @DisplayName("Should return false when target is the same square")
        void shouldReturnFalseForSameSquare() {
            // Arrange
            Queen queen = new Queen(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, queen);

            // Act
            boolean isSameSquare = queen.isPseudoLegalMove(centerPos, board);

            // Assert
            assertThat(isSameSquare).isFalse();
        }
    }

    @Nested
    @DisplayName("Obstruction & Collision Logic")
    class CollisionTests {

        @Test
        @DisplayName("Should be blocked by friendly pieces and not jump over them")
        void shouldNotJumpOverFriendlyPieces() {
            // Arrange
            Position blocker = new Position(3, 5);
            Position target = new Position(3, 7);
            Queen queen = new Queen(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, queen);
            board.setPieceAt(blocker, new Pawn(Color.WHITE, blocker));

            // Act
            boolean canMoveToTarget = queen.isPseudoLegalMove(target, board);

            // Assert
            assertThat(canMoveToTarget).as("Queen should be blocked by friendly piece at d6").isFalse();
        }

        @Test
        @DisplayName("Should be blocked by enemy pieces on diagonal paths")
        void shouldNotJumpOverEnemyOnDiagonal() {
            // Arrange
            Position start = new Position(0, 0);
            Position blocker = new Position(1, 1);
            Position target = new Position(3, 3);
            Queen queen = new Queen(Color.WHITE, start);
            board.setPieceAt(start, queen);
            board.setPieceAt(blocker, new Pawn(Color.BLACK, blocker));

            // Act
            boolean canMoveToTarget = queen.isPseudoLegalMove(target, board);

            // Assert
            assertThat(canMoveToTarget).as("Queen cannot jump over enemy pieces on diagonals").isFalse();
        }
    }

    @Nested
    @DisplayName("Interaction & Capture Logic")
    class InteractionTests {

        @Test
        @DisplayName("Should allow capturing an enemy piece at the end of a path")
        void shouldCaptureEnemy() {
            // Arrange
            Position target = new Position(3, 6);
            Queen queen = new Queen(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, queen);
            board.setPieceAt(target, new Pawn(Color.BLACK, target));

            // Act
            boolean canCapture = queen.isPseudoLegalMove(target, board);

            // Assert
            assertThat(canCapture).isTrue();
        }

        @Test
        @DisplayName("Should prohibit moving to a square occupied by a friendly piece")
        void shouldNotCaptureFriendly() {
            // Arrange
            Position target = new Position(3, 6);
            Queen queen = new Queen(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, queen);
            board.setPieceAt(target, new Rook(Color.WHITE, target));

            // Act
            boolean canMove = queen.isPseudoLegalMove(target, board);

            // Assert
            assertThat(canMove).isFalse();
        }
    }

    @Nested
    @DisplayName("Move Generation (getPseudoLegalMoves)")
    class MoveGenerationTests {

        @Test
        @DisplayName("Should return exactly 27 moves from a central position (d4) on an empty board")
        void shouldReturnCorrectCountFromCenter() {
            // Arrange
            Queen queen = new Queen(Color.WHITE, centerPos);
            board.setPieceAt(centerPos, queen);

            // Act
            List<Position> moves = queen.getPseudoLegalMoves(board);

            // Assert
            assertThat(moves).hasSize(27);
        }

        @Test
        @DisplayName("Should include enemy square but stop further movement in that direction after capture")
        void shouldStopAddingMovesAfterCapture() {
            // Arrange
            Position start = new Position(0, 0);
            Position enemyPos = new Position(0, 3);
            Position pastEnemy = new Position(0, 4);
            Queen queen = new Queen(Color.WHITE, start);
            board.setPieceAt(start, queen);
            board.setPieceAt(enemyPos, new Pawn(Color.BLACK, enemyPos));

            // Act
            List<Position> moves = queen.getPseudoLegalMoves(board);

            // Assert
            assertThat(moves)
                .contains(enemyPos)
                .doesNotContain(pastEnemy);
        }
    }
}
