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

    @Test
    @DisplayName("Should execute En Passant capture correctly.")
    void shouldExecuteEnPassant() {
        // Arrange
        game.getBoard().clearBoard();
        Position whitePawnStart = new Position(4, 4); // e5
        Position blackPawnStart = new Position(3, 6); // d7
        Position blackPawnDoubleJump = new Position(3, 4); // d5
        Position whitePawnEnd = new Position(3, 5); // d6

        game.getBoard().setPieceAt(whitePawnStart, new Pawn(Color.WHITE, whitePawnStart));
        game.getBoard().setPieceAt(blackPawnStart, new Pawn(Color.BLACK, blackPawnStart));

        game.getBoard().setPieceAt(new Position(0,0), new King(Color.WHITE, new Position(0,0)));
        game.getBoard().setPieceAt(new Position(7,7), new King(Color.BLACK, new Position(7,7)));

        // Act
        game.makeMove(new Position(0,0), new Position(0,0));
        game = new Game(new Board(false));
        game.getBoard().setPieceAt(new Position(0,0), new King(Color.WHITE, new Position(0,0)));
        game.getBoard().setPieceAt(new Position(7,7), new King(Color.BLACK, new Position(7,7)));
        game.getBoard().setPieceAt(whitePawnStart, new Pawn(Color.WHITE, whitePawnStart));
        game.getBoard().setPieceAt(blackPawnStart, new Pawn(Color.BLACK, blackPawnStart));

        game.resign(Color.BLACK);
    }

    @Test
    @DisplayName("Should execute En Passant sequence correctly.")
    void shouldExecuteEnPassantSequence() {
        game.makeMove(new Position(4, 1), new Position(4, 3));
        game.makeMove(new Position(0, 6), new Position(0, 5));
        game.makeMove(new Position(4, 3), new Position(4, 4));
        game.makeMove(new Position(3, 6), new Position(3, 4));

        // Act
        boolean moved = game.makeMove(new Position(4, 4), new Position(3, 5));

        // Assert
        assertThat(moved).isTrue();
        assertThat(game.getBoard().getPiece(new Position(3, 4))).isEmpty();
        assertThat(game.getBoard().getPiece(new Position(3, 5)).get().getType()).isEqualTo(PieceType.PAWN);
    }

    @Test
    @DisplayName("Should update status and prevent moves after a player resigns.")
    void shouldHandleResignation() {
        game.resign(Color.WHITE);
        assertThat(game.getStatus()).isEqualTo(GameStatus.RESIGNED);
        boolean moved = game.makeMove(new Position(4, 1), new Position(4, 3));
        assertThat(moved).isFalse();
    }

    @Test
    @DisplayName("Should detect Stalemate correctly.")
    void shouldDetectStalemate() {
        // Arrange
        game.getBoard().clearBoard();

        Position whiteKingPos = new Position(0, 0);
        Position blackQueenPos = new Position(1, 2);

        game.getBoard().setPieceAt(whiteKingPos, new King(Color.WHITE, whiteKingPos));
        game.getBoard().setPieceAt(blackQueenPos, new Queen(Color.BLACK, blackQueenPos));

        // Act
        boolean isInCheck = game.isInCheck(Color.WHITE);
        boolean hasLegalMove = false;
        for (int f = 0; f < 2; f++) {
            for (int r = 0; r < 2; r++) {
                Position target = new Position(f, r);
                if (!target.equals(whiteKingPos) && game.makeMove(whiteKingPos, target)) {
                    hasLegalMove = true;
                    break;
                }
            }
        }

        // Assert
        assertThat(isInCheck).as("White King should NOT be in check").isFalse();
        assertThat(hasLegalMove).as("White should have NO legal moves").isFalse();
    }

    @Test
    @DisplayName("Should detect Draw by 50-Move Rule (100 half-moves without capture or pawn move).")
    void shouldDetectDrawBy50MoveRule() {
        // Arrange
        game.getBoard().clearBoard();
        Position whiteKingPos = new Position(0, 0); // a1
        Position blackKingPos = new Position(7, 7); // h8
        Position whiteKnightPos = new Position(1, 0); // b1
        Position blackKnightPos = new Position(6, 7); // g8

        game.getBoard().setPieceAt(whiteKingPos, new King(Color.WHITE, whiteKingPos));
        game.getBoard().setPieceAt(blackKingPos, new King(Color.BLACK, blackKingPos));
        game.getBoard().setPieceAt(whiteKnightPos, new Knight(Color.WHITE, whiteKnightPos));
        game.getBoard().setPieceAt(blackKnightPos, new Knight(Color.BLACK, blackKnightPos));

        for (int i = 0; i < 49; i++) {
            game.makeMove(new Position(1, 0), new Position(2, 2));
            game.makeMove(new Position(6, 7), new Position(5, 5));
            game.makeMove(new Position(2, 2), new Position(1, 0));
            game.makeMove(new Position(5, 5), new Position(6, 7));
        }

        game.makeMove(new Position(1, 0), new Position(2, 2));
        game.makeMove(new Position(6, 7), new Position(5, 5));

        // Assert
        assertThat(game.getStatus()).isEqualTo(GameStatus.DRAW);
        boolean movedAfterDraw = game.makeMove(new Position(2, 2), new Position(1, 0));
        assertThat(movedAfterDraw).isFalse();
    }

    @Test
    @DisplayName("Should detect Draw by Threefold Repetition.")
    void shouldDetectDrawByThreefoldRepetition() {
        game.makeMove(new Position(1, 0), new Position(2, 2));
        game.makeMove(new Position(1, 7), new Position(2, 5));
        game.makeMove(new Position(2, 2), new Position(1, 0));
        game.makeMove(new Position(2, 5), new Position(1, 7));

        assertThat(game.getStatus()).isEqualTo(GameStatus.ACTIVE);

        game.makeMove(new Position(1, 0), new Position(2, 2));
        game.makeMove(new Position(1, 7), new Position(2, 5));
        game.makeMove(new Position(2, 2), new Position(1, 0));
        game.makeMove(new Position(2, 5), new Position(1, 7));

        assertThat(game.getStatus()).isEqualTo(GameStatus.DRAW);
    }
}
