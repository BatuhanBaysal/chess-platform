package com.batuhan.chess.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class KnightTest {

    private Board board;

    @BeforeEach
    void setUp() {
        // Professional Approach: Every test starts with an isolated, empty board.
        board = new Board(false);
    }

    @Test
    @DisplayName("Knight should move in an L-shape (2 vertical, 1 horizontal)")
    void knightShouldMoveInShapeVertical() {
        // Arrange
        Position start = new Position(1, 0); // b1
        Position target = new Position(2, 2); // c3
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);

        // Act & Assert
        assertThat(knight.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Knight should move in an L-shape (1 vertical, 2 horizontal).")
    void knightShouldMoveInLShapeHorizontal() {
        // Arrange
        Position start = new Position(3, 3); // d4
        Position target = new Position(5, 4); // f5
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);

        // Act & Assert
        assertThat(knight.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Knight should capture an enemy piece at the target L-position.")
    void knightShouldCaptureEnemy() {
        // Arrange
        Position start = new Position(3, 3); // d4
        Position target = new Position(4, 5); // e6
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);
        board.setPieceAt(target, new Pawn(Color.BLACK, target));

        // Act & Assert
        assertThat(knight.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Knight should not move to a square occupied by a friendly piece.")
    void knightShouldNotCaptureFriendly() {
        // Arrange
        Position start = new Position(3, 3); // d4
        Position target = new Position(4, 5); // e6
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);
        board.setPieceAt(target, new Rook(Color.WHITE, target));

        // Act & Assert
        assertThat(knight.isValidMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Knight should not move in a straight line.")
    void knightShouldNotMoveStraight() {
        // Arrange
        Position start = new Position(3, 3); // d4
        Position target = new Position(3, 5); // d6
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);

        // Act & Assert
        assertThat(knight.isValidMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Knight should move to all 8 possible L-shape positions from center.")
    void knightShouldMoveToAllEightPositions() {
        // Arrange
        Position start = new Position(4, 4); // e5
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);

        // Act & Assert
        int[][] moves = {
            {6, 5}, {6, 3}, {2, 5}, {2, 3}, // 2 horizontal, 1 vertical
            {5, 6}, {3, 6}, {5, 2}, {3, 2}  // 1 horizontal, 2 vertical
        };

        for (int[] move : moves) {
            assertThat(knight.isValidMove(new Position(move[0], move[1]), board)).isTrue();
        }
    }

    @Test
    @DisplayName("Knight should not move to the same position it is currently on.")
    void knightShouldNotMoveToSamePosition() {
        // Arrange
        Position start = new Position(4, 4);
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);

        // Act & Assert
        assertThat(knight.isValidMove(start, board)).isFalse();
    }

    @Test
    @DisplayName("Knight should not move in a diagonal line (e.g., 2x2 square).")
    void knightShouldNotMoveDiagonally() {
        // Arrange
        Position start = new Position(4, 4);
        Position target = new Position(6, 6); // 2x2 diagonal
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);

        // Act & Assert
        assertThat(knight.isValidMove(target, board)).isFalse();
    }
}
