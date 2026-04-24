package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Domain-level unit tests for Bishop movement logic.
 * Validates diagonal movement patterns, obstacle detection, and capture rules.
 */
@DisplayName("Bishop Piece Logic Tests")
class BishopTest {

    private Board board;

    @BeforeEach
    void setUp() {
        board = new Board(false);
    }

    @Nested
    @DisplayName("Single Move Validation (isPseudoLegalMove)")
    class IsPseudoLegalMoveTests {

        @Test
        @DisplayName("Should allow basic diagonal movement across the board")
        void shouldMoveDiagonally() {
            // Arrange
            Position start = new Position(2, 0); // c1
            Position target = new Position(5, 3); // f4
            Bishop bishop = new Bishop(Color.WHITE, start);
            board.setPieceAt(start, bishop);

            // Act
            boolean isLegal = bishop.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isLegal).as("Bishop should move diagonally on an empty path").isTrue();
        }

        @Test
        @DisplayName("Should block movement if another piece is in the way")
        void shouldNotMoveWhenPathIsBlocked() {
            // Arrange
            Position start = new Position(2, 0); // c1
            Position target = new Position(5, 3); // f4
            Bishop bishop = new Bishop(Color.WHITE, start);
            board.setPieceAt(start, bishop);

            Position blockerPosition = new Position(3, 1); // d2
            board.setPieceAt(blockerPosition, new Pawn(Color.WHITE, blockerPosition));

            // Act
            boolean isLegal = bishop.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isLegal).as("Path is blocked by a friendly pawn at d2").isFalse();
        }

        @Test
        @DisplayName("Should allow capturing an enemy piece")
        void shouldCaptureEnemy() {
            // Arrange
            Position start = new Position(2, 0); // c1
            Position target = new Position(4, 2); // e3
            Bishop bishop = new Bishop(Color.WHITE, start);
            board.setPieceAt(start, bishop);
            board.setPieceAt(target, new Pawn(Color.BLACK, target));

            // Act
            boolean isLegal = bishop.isPseudoLegalMove(target, board);

            // Assert
            assertThat(isLegal).as("Bishop should be able to capture black pawn on e3").isTrue();
        }
    }

    @Nested
    @DisplayName("Batch Move Generation (getPseudoLegalMoves)")
    class GetPseudoLegalMovesTests {

        @Test
        @DisplayName("Should generate all 13 possible diagonal moves from the center (e5)")
        void shouldReturnCorrectMovesFromCenter() {
            // Arrange
            Position start = new Position(4, 4); // e5
            Bishop bishop = new Bishop(Color.WHITE, start);
            board.setPieceAt(start, bishop);

            // Act
            List<Position> moves = bishop.getPseudoLegalMoves(board);

            // Assert
            assertThat(moves)
                .as("A central bishop should have 13 available squares")
                .hasSize(13)
                .contains(new Position(7, 7), new Position(1, 1), new Position(7, 1), new Position(2, 6));
        }

        @Test
        @DisplayName("Should stop move generation exactly at the enemy piece's square")
        void shouldStopAfterCapture() {
            // Arrange
            Position start = new Position(0, 0); // a1
            Bishop bishop = new Bishop(Color.WHITE, start);
            board.setPieceAt(start, bishop);

            Position enemyPos = new Position(1, 1); // b2
            board.setPieceAt(enemyPos, new Pawn(Color.BLACK, enemyPos));

            // Act
            List<Position> moves = bishop.getPseudoLegalMoves(board);

            // Assert
            assertThat(moves)
                .as("Moves should include the enemy square but nothing beyond it")
                .containsExactly(enemyPos);
        }

        @Test
        @DisplayName("Should handle board edges correctly from corners")
        void shouldHandleBoundaries() {
            // Arrange
            Position start = new Position(7, 0); // h1
            Bishop bishop = new Bishop(Color.WHITE, start);
            board.setPieceAt(start, bishop);

            // Act
            List<Position> moves = bishop.getPseudoLegalMoves(board);

            // Assert
            assertThat(moves)
                .as("Bishop on h1 should only have 7 moves along one diagonal")
                .hasSize(7)
                .allMatch(p -> p.file() < 7 && p.rank() > 0);
        }
    }
}
