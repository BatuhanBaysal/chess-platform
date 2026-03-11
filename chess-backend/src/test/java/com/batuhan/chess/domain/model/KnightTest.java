package com.batuhan.chess.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class KnightTest {

    private Board board;

    @BeforeEach
    void setUp() {
        board = new Board();
    }

    @Test
    @DisplayName("Knight should move in an L-shape (2 vertical, 1 horizontal)")
    void knightShouldMoveInShapeVertical() {
        Position start = new Position(1, 0); // b1
        Position target = new Position(2, 2); // c3
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);

        assertThat(knight.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Knight should move in an L-shape (1 vertical, 2 horizontal).")
    void knightShouldMoveInLShapeHorizontal() {
        Position start = new Position(3, 3); // d4
        Position target = new Position(5, 4); // f5
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);

        assertThat(knight.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Knight should capture an enemy piece at the target L-position.")
    void knightShouldCaptureEnemy() {
        Position start = new Position(3, 3); // d4
        Position target = new Position(4, 5); // e6
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);
        board.setPieceAt(target, new Pawn(Color.BLACK, target));

        assertThat(knight.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Knight should not move to a square occupied by a friendly piece.")
    void knightShouldNotCaptureFriendly() {
        Position start = new Position(3, 3); // d4
        Position target = new Position(4, 5); // e6
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);
        board.setPieceAt(target, new Rook(Color.WHITE, target));

        assertThat(knight.isValidMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Knight should not move in a straight line.")
    void knightShouldNotMoveStraight() {
        Position start = new Position(3, 3); // d4
        Position target = new Position(3, 5); // d6
        Knight knight = new Knight(Color.WHITE, start);
        board.setPieceAt(start, knight);

        assertThat(knight.isValidMove(target, board)).isFalse();
    }
}
