package com.batuhan.chess.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class PawnTest {

    private Board board;

    @BeforeEach
    void setUp() {
        board = new Board();
    }

    @Test
    @DisplayName("White pawn should move forward 1 square.")
    void whitePawnShouldMoveForwardOneSquare() {
        Position start = new Position(0,1); // a2
        Position target = new Position(0,2); // a3
        Piece pawn = board.getPiece(start).orElseThrow();

        assertThat(pawn.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("White pawn should be able to move 2 squares from its starting position.")
    void whitePawnShouldMoveTwoSquaresOnFirstMove() {
        Position start = new Position(4, 1); // e2
        Position target = new Position(4, 3); // e4
        Piece pawn = board.getPiece(start).orElseThrow();

        assertThat(pawn.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Pawn should not move forward if the square is occupied.")
    void pawnShouldNotMoveToOccupiedSquare() {
        Position start = new Position(0, 1); // a2
        Position blocker = new Position(0, 2); // a3
        Position target = new Position(0, 2);

        board.setPieceAt(blocker, new Rook(Color.BLACK, blocker));
        Piece pawn = board.getPiece(start).orElseThrow();

        assertThat(pawn.isValidMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("White pawn should capture black piece diagonally.")
    void whitePawnShouldCaptureDiagonally() {
        Position start = new Position(3, 1); // d2
        Position target = new Position(4, 2); // e3

        board.setPieceAt(target, new Knight(Color.BLACK, target));
        Piece pawn = board.getPiece(start).orElseThrow();

        assertThat(pawn.isValidMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Pawn should not move diagonally to an empty square.")
    void pawnShouldNotMoveDiagonallyToEmptySquare() {
        Position start = new Position(3, 1); // d2
        Position target = new Position(4, 2); // e3

        Piece pawn = board.getPiece(start).orElseThrow();

        assertThat(pawn.isValidMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Pawn should not move backwards.")
    void pawnShouldNotMoveBackwards() {
        Position start = new Position(4, 3); // e4
        Position target = new Position(4, 2); // e3

        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);

        assertThat(pawn.isValidMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("White pawn should not capture its own piece diagonally.")
    void whitePawnShouldNotCaptureFriendlyPiece() {
        Position start = new Position(3, 1); // d2
        Position target = new Position(4, 2); // e3

        board.setPieceAt(target, new Bishop(Color.WHITE, target));
        Piece pawn = board.getPiece(start).orElseThrow();

        assertThat(pawn.isValidMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Pawn cannot jump over a piece during its initial two-square move.")
    void pawnShouldNotJumpOverPiece() {
        Position start = new Position(4, 1); // e2
        Position blocker = new Position(4, 2); // e3
        Position target = new Position(4, 3); // e4

        board.setPieceAt(blocker, new Knight(Color.BLACK, blocker));
        Piece pawn = board.getPiece(start).orElseThrow();

        assertThat(pawn.isValidMove(target, board)).isFalse();
    }
}
