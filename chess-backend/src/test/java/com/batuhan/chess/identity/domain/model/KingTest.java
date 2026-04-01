package com.batuhan.chess.identity.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class KingTest {

    private Board board;

    @BeforeEach
    void setUp() {
        // Professional Approach: Isolated empty board for unit testing
        board = new Board(false);
    }

    @Test
    @DisplayName("King should move one square in any direction.")
    void kingShouldMoveOneSquareInAnyDirection() {
        // Arrange
        Position start = new Position(4, 4); // e5
        King king = new King(Color.WHITE, start);
        board.setPieceAt(start, king);

        // Act & Assert
        assertThat(king.isValidMove(new Position(4, 5), board)).isTrue(); // Up
        assertThat(king.isValidMove(new Position(5, 5), board)).isTrue(); // Up-Right
        assertThat(king.isValidMove(new Position(3, 4), board)).isTrue(); // Left
    }

    @Test
    @DisplayName("King should not move more than one square.")
    void kingShouldNotMoveMoreThanOneSquare() {
        // Arrange
        Position start = new Position(4, 4);
        King king = new King(Color.WHITE, start);
        board.setPieceAt(start, king);

        // Act & Assert
        assertThat(king.isValidMove(new Position(4, 6), board)).isFalse(); // Two squares up
        assertThat(king.isValidMove(new Position(6, 6), board)).isFalse(); // Two squares diagonal
    }

    @Test
    @DisplayName("King should capture an enemy piece.")
    void kingShouldCaptureEnemy() {
        // Arrange
        Position start = new Position(4, 4);
        Position target = new Position(4, 5);
        King king = new King(Color.WHITE, start);
        board.setPieceAt(start, king);
        board.setPieceAt(target, new Pawn(Color.BLACK, target)); // Enemy

        // Act & Assert
        assertThat(king.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("King should not move to a square occupied by a friendly piece.")
    void kingShouldNotCaptureFriendly() {
        // Arrange
        Position start = new Position(4, 4);
        Position target = new Position(4, 5);
        King king = new King(Color.WHITE, start);
        board.setPieceAt(start, king);
        board.setPieceAt(target, new Rook(Color.WHITE, target)); // Friendly

        // Act & Assert
        assertThat(king.isValidMove(target, board)).isFalse();
    }
}
