package com.batuhan.chess.domain.model;

import com.batuhan.chess.domain.model.chess.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class PawnTest {

    private Board board;

    @BeforeEach
    void setUp() {
        // Professional Approach: Every test starts with an isolated, empty board.
        board = new Board(false);
    }

    @Test
    @DisplayName("White pawn should move forward 1 square.")
    void whitePawnShouldMoveForwardOneSquare() {
        // Arrange
        Position start = new Position(0, 1); // a2
        Position target = new Position(0, 2); // a3
        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);

        // Act & Assert
        assertThat(pawn.isPseudoLegalMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Black pawn should move downward.")
    void blackPawnShouldMoveDownward() {
        // Arrange
        Position start = new Position(0, 6); // a7
        Position target = new Position(0, 5); // a6
        Pawn blackPawn = new Pawn(Color.BLACK, start);
        board.setPieceAt(start, blackPawn);

        // Act & Assert
        assertThat(blackPawn.isPseudoLegalMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("White pawn should be able to move 2 squares from its starting position.")
    void whitePawnShouldMoveTwoSquaresOnFirstMove() {
        // Arrange
        Position start = new Position(4, 1); // e2
        Position target = new Position(4, 3); // e4
        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);

        // Act & Assert
        assertThat(pawn.isPseudoLegalMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Pawn should not move forward if the square is occupied.")
    void pawnShouldNotMoveToOccupiedSquare() {
        // Arrange
        Position start = new Position(0, 1); // a2
        Position target = new Position(0, 2); // a3
        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);

        // Place a blocker on the target square
        board.setPieceAt(target, new Rook(Color.BLACK, target));

        // Act & Assert
        assertThat(pawn.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("White pawn should capture black piece diagonally.")
    void whitePawnShouldCaptureDiagonally() {
        // Arrange
        Position start = new Position(3, 1); // d2
        Position target = new Position(4, 2); // e3
        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);

        // Place an enemy piece to be captured
        board.setPieceAt(target, new Knight(Color.BLACK, target));

        // Act & Assert
        assertThat(pawn.isPseudoLegalMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Pawn should not move diagonally to an empty square.")
    void pawnShouldNotMoveDiagonallyToEmptySquare() {
        // Arrange
        Position start = new Position(3, 1); // d2
        Position target = new Position(4, 2); // e3
        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);

        // Act & Assert
        assertThat(pawn.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Pawn should not move backwards.")
    void pawnShouldNotMoveBackwards() {
        // Arrange
        Position start = new Position(4, 3); // e4
        Position target = new Position(4, 2); // e3
        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);

        // Act & Assert
        assertThat(pawn.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("White pawn should not capture its own piece diagonally.")
    void whitePawnShouldNotCaptureFriendlyPiece() {
        // Arrange
        Position start = new Position(3, 1); // d2
        Position target = new Position(4, 2); // e3
        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);

        // Place a friendly piece on target
        board.setPieceAt(target, new Bishop(Color.WHITE, target));

        // Act & Assert
        assertThat(pawn.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Pawn cannot jump over a piece during its initial two-square move.")
    void pawnShouldNotJumpOverPiece() {
        // Arrange
        Position start = new Position(4, 1); // e2
        Position blocker = new Position(4, 2); // e3
        Position target = new Position(4, 3); // e4

        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);

        // Place a piece in the middle of the 2-square move
        board.setPieceAt(blocker, new Knight(Color.BLACK, blocker));

        // Act & Assert
        assertThat(pawn.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Pawn should not move 2 squares if it is not on its starting rank.")
    void pawnShouldNotMoveTwoSquaresFromOtherRanks() {
        // Arrange
        Position start = new Position(4, 2); // e3 (Not a starting position)
        Position target = new Position(4, 4); // e5
        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);

        // Act & Assert
        assertThat(pawn.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Pawn should not move forward if blocked by a friendly piece.")
    void pawnShouldNotMoveIfBlockedByFriendlyPiece() {
        // Arrange
        Position start = new Position(0, 1);
        Position target = new Position(0, 2);
        Pawn pawn = new Pawn(Color.WHITE, start);
        board.setPieceAt(start, pawn);
        board.setPieceAt(target, new Bishop(Color.WHITE, target)); // Friendly blocker

        // Act & Assert
        assertThat(pawn.isPseudoLegalMove(target, board)).isFalse();
    }
}
