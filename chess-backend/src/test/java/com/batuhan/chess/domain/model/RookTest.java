package com.batuhan.chess.domain.model;

import com.batuhan.chess.domain.model.chess.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class RookTest {

    private Board board;

    @BeforeEach
    void setUp() {
        // Professional Approach: Isolated empty board for unit testing
        board = new Board(false);
    }

    @Test
    @DisplayName("Rook should move horizontally.")
    void rookShouldMoveHorizontally() {
        // Arrange
        Position start = new Position(0, 0); // a1
        Position target = new Position(5, 0); // f1
        Rook rook = new Rook(Color.WHITE, start);
        board.setPieceAt(start, rook);

        // Act & Assert
        assertThat(rook.isPseudoLegalMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Rook should move vertically.")
    void rookShouldMoveVertically() {
        // Arrange
        Position start = new Position(0, 0); // a1
        Position target = new Position(0, 5); // a6
        Rook rook = new Rook(Color.WHITE, start);
        board.setPieceAt(start, rook);

        // Act & Assert
        assertThat(rook.isPseudoLegalMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Rook should not move if the path is blocked.")
    void rookShouldNotMoveWhenPathIsBlocked() {
        // Arrange
        Position start = new Position(0, 0); // a1
        Position target = new Position(0, 5); //a6
        Rook rook = new Rook(Color.WHITE, start);
        board.setPieceAt(start, rook);

        // Blocker at a3
        Position blocker = new Position(0, 2); // a3
        board.setPieceAt(blocker, new Pawn(Color.WHITE, blocker));

        // Act & Assert
        assertThat(rook.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Rook should not move diagonally.")
    void rookShouldNotMoveDiagonally() {
        // Arrange
        Position start = new Position(0, 0); // a1
        Position target = new Position(2, 2); // c3
        Rook rook = new Rook(Color.WHITE, start);
        board.setPieceAt(start, rook);

        // Act & Assert
        assertThat(rook.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Rook should capture an enemy piece.")
    void rookShouldCaptureEnemy() {
        // Arrange
        Position start = new Position(0, 0); // a1
        Position target = new Position(0, 3); // a4
        Rook rook = new Rook(Color.WHITE, start);
        board.setPieceAt(start, rook);

        // Enemy piece on target
        board.setPieceAt(target, new Pawn(Color.BLACK, target));

        // Act & Assert
        assertThat(rook.isPseudoLegalMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Rook should not move to a square occupied by a friendly piece.")
    void rookShouldNotCaptureFriendly() {
        // Arrange
        Position start = new Position(0, 0); // a1
        Position target = new Position(0, 3); // a4
        Rook rook = new Rook(Color.WHITE, start);
        board.setPieceAt(start, rook);

        // Friendly piece on target
        board.setPieceAt(target, new Bishop(Color.WHITE, target));

        // Act & Assert
        assertThat(rook.isPseudoLegalMove(target, board)).isFalse();
    }
}
