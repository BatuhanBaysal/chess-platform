package com.batuhan.chess.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class QueenTest {

    private Board board;

    @BeforeEach
    void setUp() {
        // Professional Approach: Isolated empty board for unit testing
        board = new Board(false);
    }

    @Test
    @DisplayName("Queen should move in all 8 directions.")
    void queenShouldMoveInAllDirections() {
        //Arrange
        Position start = new Position(3, 3); // d4
        Queen queen = new Queen(Color.WHITE, start);
        board.setPieceAt(start, queen);

        // Act & Assert
        assertThat(queen.isValidMove(new Position(3, 7), board)).isTrue(); // d8 - Up
        assertThat(queen.isValidMove(new Position(3, 0), board)).isTrue(); // d1 - Down
        assertThat(queen.isValidMove(new Position(7, 3), board)).isTrue(); // h4 - Right
        assertThat(queen.isValidMove(new Position(0, 3), board)).isTrue(); // a4 - Left
        assertThat(queen.isValidMove(new Position(7, 7), board)).isTrue(); // h8 - Up-Right
        assertThat(queen.isValidMove(new Position(0, 0), board)).isTrue(); // a1 - Down-Left
    }

    @Test
    @DisplayName("Queen should not move like a Knight.")
    void queenShouldNotMoveInLShape() {
        // Arrange
        Position start = new Position(3, 3); // d4
        Queen queen = new Queen(Color.WHITE, start);
        board.setPieceAt(start, queen);

        // Act & Assert
        assertThat(queen.isValidMove(new Position(4, 5), board)).isFalse(); // e6 - L-shape move
    }

    @Test
    @DisplayName("Queen should not jump over pieces.")
    void queenShouldNotJumpOverPieces() {
        // Arrange
        Position start = new Position(0, 0); // a1
        Position target = new Position(0, 5); // a6
        Queen queen = new Queen(Color.WHITE, start);
        board.setPieceAt(start, queen);

        // Blocker on the path
        board.setPieceAt(new Position(0, 2), new Pawn(Color.WHITE, new Position(0, 2))); // a3

        // Act & Assert
        assertThat(queen.isValidMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Queen should move in all 8 directions including all diagonals.")
    void queenShouldMoveInAllEightDirections() {
        // Arrange
        Position start = new Position(3, 3); // d4
        Queen queen = new Queen(Color.WHITE, start);
        board.setPieceAt(start, queen);

        // Act & Assert
        // Straight lines
        assertThat(queen.isValidMove(new Position(3, 7), board)).isTrue(); // d8 - Up
        assertThat(queen.isValidMove(new Position(3, 0), board)).isTrue(); // d1 - Down
        assertThat(queen.isValidMove(new Position(7, 3), board)).isTrue(); // h4 - Right
        assertThat(queen.isValidMove(new Position(0, 3), board)).isTrue(); // a4 - Left

        // Diagonals
        assertThat(queen.isValidMove(new Position(7, 7), board)).isTrue(); // h8 - Up-Right
        assertThat(queen.isValidMove(new Position(0, 0), board)).isTrue(); // a1 - Down-Left
        assertThat(queen.isValidMove(new Position(0, 6), board)).isTrue(); // a7 - Up-Left
        assertThat(queen.isValidMove(new Position(6, 0), board)).isTrue(); // g1- Down-Right
    }

    @Test
    @DisplayName("Queen should capture an enemy piece.")
    void queenShouldCaptureEnemy() {
        // Arrange
        Position start = new Position(3, 3); // d4
        Position target = new Position(3, 6); // d7
        Queen queen = new Queen(Color.WHITE, start);
        board.setPieceAt(start, queen);

        // Place an enemy piece on the target square
        board.setPieceAt(target, new Pawn(Color.BLACK, target));

        // Act & Assert
        assertThat(queen.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Queen should not move to a square occupied by a friendly piece.")
    void queenShouldNotCaptureFriendly() {
        // Arrange
        Position start = new Position(3, 3); // d4
        Position target = new Position(3, 6); // d7
        Queen queen = new Queen(Color.WHITE, start);
        board.setPieceAt(start, queen);

        // Place a friendly piece on the target square
        board.setPieceAt(target, new Rook(Color.WHITE, target));

        // Act & Assert
        assertThat(queen.isValidMove(target, board)).isFalse();
    }
}
