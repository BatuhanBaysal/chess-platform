package com.batuhan.chess.domain.model;

import com.batuhan.chess.domain.model.chess.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class BishopTest {

    private Board board;

    @BeforeEach
    void setUp() {
        // Professional Approach: Every test starts with an isolated, empty board.
        board = new Board(false);
    }

    @Test
    @DisplayName("Bishop should move diagonally.")
    void bishopShouldMoveDiagonally() {
        // Arrange
        Position start = new Position(2, 0); // c1
        Position target = new Position(5, 3); // f4
        Bishop bishop = new Bishop(Color.WHITE, start);
        board.setPieceAt(start, bishop);

        // Act & Assert
        assertThat(bishop.isPseudoLegalMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Bishop should not move if the path is blocked.")
    void bishopShouldNotMoveWhenPathIsBlocked() {
        // Arrange
        Position start = new Position(2, 0); // c1
        Position target = new Position(5, 3); // f4
        Bishop bishop = new Bishop(Color.WHITE, start);
        board.setPieceAt(start, bishop);

        // Place a friendly blocker on the path (d2)
        Position blockerPosition = new Position(3, 1);
        board.setPieceAt(blockerPosition, new Pawn(Color.WHITE, blockerPosition));

        // Act & Assert
        assertThat(bishop.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Bishop should capture an enemy piece on a diagonal path.")
    void bishopShouldCaptureEnemy() {
        // Arrange
        Position start = new Position(2, 0); // c1
        Position target = new Position(4, 2); // e3
        Bishop bishop = new Bishop(Color.WHITE, start);
        board.setPieceAt(start, bishop);

        // Place an enemy piece on the target square
        board.setPieceAt(target, new Pawn(Color.BLACK, target));

        // Act & Assert
        assertThat(bishop.isPseudoLegalMove(target, board)).isTrue();
    }

    @Test
    @DisplayName("Bishop should not move to a square occupied by a friendly piece.")
    void bishopShouldNotCaptureFriendlyPiece() {
        // Arrange
        Position start = new Position(2, 0); // c1
        Position target = new Position(4, 2); // e3
        Bishop bishop = new Bishop(Color.WHITE, start);
        board.setPieceAt(start, bishop);

        // Place a friendly piece on the target
        board.setPieceAt(target, new Pawn(Color.WHITE, target));

        // Act & Assert
        assertThat(bishop.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Bishop should not move in a non-diagonal line.")
    void bishopShouldNotMoveNonDiagonally() {
        // Arrange
        Position start = new Position(2, 0); // c1
        Position target = new Position(2, 3); // c4 (Straight move)
        Bishop bishop = new Bishop(Color.WHITE, start);
        board.setPieceAt(start, bishop);

        // Act & Assert
        assertThat(bishop.isPseudoLegalMove(target, board)).isFalse();
    }

    @Test
    @DisplayName("Bishop should move in all four diagonal directions.")
    void bishopShouldMoveInAllDiagonalDirections() {
        // Arrange
        Position start = new Position(4, 4); // e5 (Center)
        Bishop bishop = new Bishop(Color.WHITE, start);
        board.setPieceAt(start, bishop);

        // Act & Assert
        assertThat(bishop.isPseudoLegalMove(new Position(6, 6), board)).isTrue(); // Up-Right
        assertThat(bishop.isPseudoLegalMove(new Position(2, 2), board)).isTrue(); // Down-Left
        assertThat(bishop.isPseudoLegalMove(new Position(6, 2), board)).isTrue(); // Down-Right
        assertThat(bishop.isPseudoLegalMove(new Position(2, 6), board)).isTrue(); // Up-Left
    }

    @Test
    @DisplayName("Bishop should not be valid if target is the same as start position.")
    void bishopShouldNotMoveToSamePosition() {
        // Arrange
        Position start = new Position(4, 4);
        Bishop bishop = new Bishop(Color.WHITE, start);
        board.setPieceAt(start, bishop);

        // Act & Assert
        assertThat(bishop.isPseudoLegalMove(start, board)).isFalse();
    }
}
