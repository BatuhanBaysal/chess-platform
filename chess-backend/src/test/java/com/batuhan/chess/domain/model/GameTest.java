package com.batuhan.chess.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class GameTest {

    private Game game;

    @BeforeEach
    void setUp() {
        game = new Game(new Board(true));
    }

    @Test
    @DisplayName("Game should start with White turn ACTIVE status.")
    void gameShouldInitializeCorrectly() {
        assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
        assertThat(game.getStatus()).isEqualTo(GameStatus.ACTIVE);
    }

    @Test
    @DisplayName("Turn should switch to Black after a valid White move.")
    void turnShouldSwitchAfterValidMove() {
        // Arrange
        Position start = new Position(4, 1); // e2
        Position end = new Position(4, 3); // e4

        // Act
        boolean moved = game.makeMove(start, end);

        // Assert
        assertThat(moved).isTrue();
        assertThat(game.getCurrentTurn()).isEqualTo(Color.BLACK);
    }

    @Test
    @DisplayName("Black should not be able to move during White's turn.")
    void shouldNotAllowMovingOutOfTurn() {
        // Arrange
        Position start = new Position(4, 6); // e7
        Position end = new Position(4, 4); // e5

        // Act
        boolean moved = game.makeMove(start, end);

        // Assert
        assertThat(moved).isFalse();
        assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
    }

    @Test
    @DisplayName("Should not allow move if target is invalid for the piece.")
    void shouldNotAllowInvalidPieceMove() {
        // Arrange
        Position start = new Position(4, 1); // e2
        Position end = new Position(5, 3); // f4

        // Act
        boolean moved = game.makeMove(start, end);

        // Assert
        assertThat(moved).isFalse();
        assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
    }

    @Test
    @DisplayName("Should not allow moves when game is not ACTIVE.")
    void shouldNotMoveWhenGameIsNotActive() {
        // Arrange
        game.resign(Color.WHITE);
        Position start = new Position(4, 1); // e2
        Position end = new Position(4, 3); // e4

        // Act
        boolean moved = game.makeMove(start, end);

        // Assert
        assertThat(moved).isFalse();
        assertThat(game.getStatus()).isEqualTo(GameStatus.RESIGNED);
        assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
    }

    @Test
    @DisplayName("Should detect when a King is in check.")
    void shouldDetectCheck() {
        game.getBoard().clearBoard();

        Position kingPos = new Position(4, 0); // e1
        Position rookPos = new Position(4, 7); // e8

        game.getBoard().setPieceAt(kingPos, new King(Color.WHITE, kingPos));
        game.getBoard().setPieceAt(rookPos, new Rook(Color.BLACK, rookPos));

        assertThat(game.isInCheck(Color.WHITE)).isTrue();
    }

    @Test
    @DisplayName("Should detect checkmate (Fool's Mate scenario).")
    void shouldDetectCheckmate() {
        game.makeMove(new Position(5, 1), new Position(5, 2)); // f3
        game.makeMove(new Position(4, 6), new Position(4, 4)); // e5
        game.makeMove(new Position(6, 1), new Position(6, 3)); // g4
        game.makeMove(new Position(3, 7), new Position(7, 3)); // h4

        assertThat(game.getStatus()).isEqualTo(GameStatus.CHECKMATE);
    }

    @Test
    @DisplayName("Should not allow a move that leaves the King in check (Self-Check).")
    void shouldPreventSelfCheck() {
        // Arrange
        game.getBoard().clearBoard();
        Position kingPos = new Position(4, 0); // e1
        Position bishopPos = new Position(4, 1); // e2
        Position enemyRookPos = new Position(4, 7); // e8

        game.getBoard().setPieceAt(kingPos, new King(Color.WHITE, kingPos));
        game.getBoard().setPieceAt(bishopPos, new Bishop(Color.WHITE, bishopPos));
        game.getBoard().setPieceAt(enemyRookPos, new Rook(Color.BLACK, enemyRookPos));

        // Act
        boolean moved = game.makeMove(bishopPos, new Position(3, 2));

        // Assert
        assertThat(moved).isFalse();
        assertThat(game.getBoard().getPiece(bishopPos)).isPresent();
    }

    @Test
    @DisplayName("Should not allow moving to a square occupied by a friendly piece.")
    void shouldNotCaptureFriendlyPiece() {
        // Arrange
        Position pawnStart = new Position(4, 1); // e2
        Position targetPos = new Position(3, 0); // d1

        // Act
        boolean moved = game.makeMove(pawnStart, targetPos);

        // Assert
        assertThat(moved).isFalse();
    }

    @Test
    @DisplayName("Pawn should automatically promote to Queen when reaching the last rank.")
    void shouldPromotePawnToQueen() {
        // Arrange
        game.getBoard().clearBoard();

        Position whiteKingPos = new Position(0, 0); // a1
        Position blackKingPos = new Position(7, 7); // h8
        game.getBoard().setPieceAt(whiteKingPos, new King(Color.WHITE, whiteKingPos));
        game.getBoard().setPieceAt(blackKingPos, new King(Color.BLACK, blackKingPos));

        Position start = new Position(4, 6); // e7
        Position end = new Position(4, 7);   // e8
        game.getBoard().setPieceAt(start, new Pawn(Color.WHITE, start));

        // Act
        boolean moved = game.makeMove(start, end);

        // Assert
        assertThat(moved).isTrue();
        Piece promotedPiece = game.getBoard().getPiece(end)
            .orElseThrow(() -> new AssertionError("Piece should exist at promotion square"));

        assertThat(promotedPiece.getType()).isEqualTo(PieceType.QUEEN);
        assertThat(promotedPiece.getColor()).isEqualTo(Color.WHITE);
        assertThat(game.getBoard().getPiece(start)).isEmpty();
    }

    @Test
    @DisplayName("Should execute Kingside castling correctly.")
    void shouldExecuteKingsideCastling() {
        // Arrange
        game.getBoard().clearBoard();
        Position kingStart = new Position(4, 0); // e1
        Position rookStart = new Position(7, 0); // h1
        Position kingEnd = new Position(6, 0);   // g1
        Position rookEnd = new Position(5, 0);   // f1

        game.getBoard().setPieceAt(kingStart, new King(Color.WHITE, kingStart));
        game.getBoard().setPieceAt(rookStart, new Rook(Color.WHITE, rookStart));

        Position blackKingPos = new Position(4, 7); // e8
        game.getBoard().setPieceAt(blackKingPos, new King(Color.BLACK, blackKingPos));

        // Act
        boolean moved = game.makeMove(kingStart, kingEnd);

        // Assert
        assertThat(moved).isTrue();
        assertThat(game.getBoard().getPiece(kingEnd).get().getType()).isEqualTo(PieceType.KING);
        assertThat(game.getBoard().getPiece(rookEnd).get().getType()).isEqualTo(PieceType.ROOK);
        assertThat(game.getBoard().getPiece(kingStart)).isEmpty();
        assertThat(game.getBoard().getPiece(rookStart)).isEmpty();
    }

    @Test
    @DisplayName("Should not allow castling if the path is obstructed.")
    void shouldNotCastleIfPathIsObstructed() {
        // Arrange
        game.getBoard().clearBoard();
        Position kingStart = new Position(4, 0); // e1
        Position rookStart = new Position(7, 0); // g1
        Position bishopObstructing = new Position(5, 0); // f1

        game.getBoard().setPieceAt(kingStart, new King(Color.WHITE, kingStart));
        game.getBoard().setPieceAt(rookStart, new Rook(Color.WHITE, rookStart));
        game.getBoard().setPieceAt(bishopObstructing, new Bishop(Color.WHITE, bishopObstructing));

        Position blackKingPos = new Position(4, 7); // e8
        game.getBoard().setPieceAt(blackKingPos, new King(Color.BLACK, blackKingPos));

        // Act
        boolean moved = game.makeMove(kingStart, new Position(6, 0)); // g1

        // Assert
        assertThat(moved).isFalse();
    }

    @Test
    @DisplayName("Should not allow castling if the King has already moved.")
    void shouldNotCastleIfKingHasMoved() {
        // Arrange
        game.getBoard().clearBoard();
        Position kingStart = new Position(4, 0); // e1
        Position rookStart = new Position(7, 0); // h1

        King king = new King(Color.WHITE, kingStart);
        king.setHasMoved(true);

        game.getBoard().setPieceAt(kingStart, king);
        game.getBoard().setPieceAt(rookStart, new Rook(Color.WHITE, rookStart));

        Position blackKingPos = new Position(4, 7); // e8
        game.getBoard().setPieceAt(blackKingPos, new King(Color.BLACK, blackKingPos));

        // Act
        boolean moved = game.makeMove(kingStart, new Position(6, 0)); // g1

        // Assert
        assertThat(moved).isFalse();
    }

    @Test
    @DisplayName("Should not allow castling if the King would pass through a square under attack.")
    void shouldNotCastleThroughAttack() {
        // Arrange
        game.getBoard().clearBoard();
        Position kingStart = new Position(4, 0); // e1
        Position rookStart = new Position(7, 0); // h1

        game.getBoard().setPieceAt(kingStart, new King(Color.WHITE, kingStart));
        game.getBoard().setPieceAt(rookStart, new Rook(Color.WHITE, rookStart));

        Position enemyRookPos = new Position(5, 7); // f8
        game.getBoard().setPieceAt(enemyRookPos, new Rook(Color.BLACK, enemyRookPos));

        Position blackKingPos = new Position(4, 7); // e8
        game.getBoard().setPieceAt(blackKingPos, new King(Color.BLACK, blackKingPos));

        // Act
        boolean moved = game.makeMove(kingStart, new Position(6, 0)); // g1

        // Assert
        assertThat(moved).isFalse();
    }
}
