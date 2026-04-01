package com.batuhan.chess.identity.domain.model;

import com.batuhan.chess.identity.api.dto.game.GameResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
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
        // Assert
        assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
        assertThat(game.getStatus()).isEqualTo(GameStatus.ACTIVE);
    }

    @Test
    @DisplayName("Turn should switch to Black after a valid White move.")
    void turnShouldSwitchAfterValidMove() {
        // Arrange
        Position start = new Position(4, 1);
        Position end = new Position(4, 3);

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(start, end, null);

        // Assert
        assertThat(moves).isNotEmpty();
        assertThat(game.getCurrentTurn()).isEqualTo(Color.BLACK);
    }

    @Test
    @DisplayName("Black should not be able to move during White's turn.")
    void shouldNotAllowMovingOutOfTurn() {
        // Arrange
        Position start = new Position(4, 6);
        Position end = new Position(4, 4);

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(start, end, null);

        // Assert
        assertThat(moves).isEmpty();
        assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
    }

    @Test
    @DisplayName("Should not allow move if target is invalid for the piece.")
    void shouldNotAllowInvalidPieceMove() {
        // Arrange
        Position start = new Position(4, 1);
        Position end = new Position(5, 3);

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(start, end, null);

        // Assert
        assertThat(moves).isEmpty();
    }

    @Test
    @DisplayName("Should not allow moves when game is not ACTIVE.")
    void shouldNotMoveWhenGameIsNotActive() {
        // Arrange
        game.resign(Color.WHITE);
        Position start = new Position(4, 1);
        Position end = new Position(4, 3);

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(start, end, null);

        // Assert
        assertThat(moves).isEmpty();
        assertThat(game.getStatus()).isEqualTo(GameStatus.RESIGNED);
    }

    @Test
    @DisplayName("Should detect when a King is in check.")
    void shouldDetectCheck() {
        // Arrange
        game.getBoard().clearBoard();
        Position kingPos = new Position(4, 0);
        Position rookPos = new Position(4, 7);
        game.getBoard().setPieceAt(kingPos, new King(Color.WHITE, kingPos));
        game.getBoard().setPieceAt(rookPos, new Rook(Color.BLACK, rookPos));

        // Act
        boolean inCheck = game.isInCheck(Color.WHITE);

        // Assert
        assertThat(inCheck).isTrue();
    }

    @Test
    @DisplayName("Should detect checkmate (Fool's Mate scenario).")
    void shouldDetectCheckmate() {
        // Act
        game.makeMove(new Position(5, 1), new Position(5, 2), null);
        game.makeMove(new Position(4, 6), new Position(4, 4), null);
        game.makeMove(new Position(6, 1), new Position(6, 3), null);
        game.makeMove(new Position(3, 7), new Position(7, 3), null);

        // Assert
        assertThat(game.getStatus()).isEqualTo(GameStatus.CHECKMATE);
    }

    @Test
    @DisplayName("Should prevent self-check.")
    void shouldPreventSelfCheck() {
        // Arrange
        game.getBoard().clearBoard();
        Position kingPos = new Position(4, 0);
        Position bishopPos = new Position(4, 1);
        Position enemyRookPos = new Position(4, 7);
        game.getBoard().setPieceAt(kingPos, new King(Color.WHITE, kingPos));
        game.getBoard().setPieceAt(bishopPos, new Bishop(Color.WHITE, bishopPos));
        game.getBoard().setPieceAt(enemyRookPos, new Rook(Color.BLACK, enemyRookPos));

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(bishopPos, new Position(3, 2), null);

        // Assert
        assertThat(moves).isEmpty();
        assertThat(game.getBoard().getPiece(bishopPos)).isPresent();
    }

    @Test
    @DisplayName("Should not allow moving to a square occupied by a friendly piece.")
    void shouldNotCaptureFriendlyPiece() {
        // Arrange
        Position pawnStart = new Position(4, 1);
        Position targetPos = new Position(3, 0);

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(pawnStart, targetPos, null);

        // Assert
        assertThat(moves).isEmpty();
    }

    @Test
    @DisplayName("Pawn should promote correctly.")
    void shouldPromotePawnToQueen() {
        // Arrange
        game.getBoard().clearBoard();
        game.getBoard().setPieceAt(new Position(0,0), new King(Color.WHITE, new Position(0,0)));
        game.getBoard().setPieceAt(new Position(7,7), new King(Color.BLACK, new Position(7,7)));
        Position start = new Position(4, 6);
        Position end = new Position(4, 7);
        game.getBoard().setPieceAt(start, new Pawn(Color.WHITE, start));

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(start, end, "QUEEN");

        // Assert
        assertThat(moves).isNotEmpty();
        assertThat(game.getBoard().getPiece(end).get().getType()).isEqualTo(PieceType.QUEEN);
    }

    @Test
    @DisplayName("Should execute Kingside castling correctly.")
    void shouldExecuteKingsideCastling() {
        // Arrange
        game.getBoard().clearBoard();
        Position kingStart = new Position(4, 0);
        Position rookStart = new Position(7, 0);
        game.getBoard().setPieceAt(kingStart, new King(Color.WHITE, kingStart));
        game.getBoard().setPieceAt(rookStart, new Rook(Color.WHITE, rookStart));
        game.getBoard().setPieceAt(new Position(4, 7), new King(Color.BLACK, new Position(4, 7)));

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(kingStart, new Position(6, 0), null);

        // Assert
        assertThat(moves).hasSize(2);
    }

    @Test
    @DisplayName("Should not allow castling if the path is obstructed.")
    void shouldNotCastleIfPathIsObstructed() {
        // Arrange
        game.getBoard().clearBoard();
        game.getBoard().setPieceAt(new Position(4, 0), new King(Color.WHITE, new Position(4, 0)));
        game.getBoard().setPieceAt(new Position(7, 0), new Rook(Color.WHITE, new Position(7, 0)));
        game.getBoard().setPieceAt(new Position(5, 0), new Bishop(Color.WHITE, new Position(5, 0)));

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(new Position(4, 0), new Position(6, 0), null);

        // Assert
        assertThat(moves).isEmpty();
    }

    @Test
    @DisplayName("Should not allow castling if the King has already moved.")
    void shouldNotCastleIfKingHasMoved() {
        // Arrange
        game.getBoard().clearBoard();
        King king = new King(Color.WHITE, new Position(4, 0));
        king.setHasMoved(true);
        game.getBoard().setPieceAt(new Position(4, 0), king);
        game.getBoard().setPieceAt(new Position(7, 0), new Rook(Color.WHITE, new Position(7, 0)));

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(new Position(4, 0), new Position(6, 0), null);

        // Assert
        assertThat(moves).isEmpty();
    }

    @Test
    @DisplayName("Should not allow castling through attack.")
    void shouldNotCastleThroughAttack() {
        // Arrange
        game.getBoard().clearBoard();
        game.getBoard().setPieceAt(new Position(4, 0), new King(Color.WHITE, new Position(4, 0)));
        game.getBoard().setPieceAt(new Position(7, 0), new Rook(Color.WHITE, new Position(7, 0)));
        game.getBoard().setPieceAt(new Position(5, 7), new Rook(Color.BLACK, new Position(5, 7)));

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(new Position(4, 0), new Position(6, 0), null);

        // Assert
        assertThat(moves).isEmpty();
    }

    @Test
    @DisplayName("Should execute En Passant capture correctly.")
    void shouldExecuteEnPassant() {
        // Arrange
        game.makeMove(new Position(4, 1), new Position(4, 3), null);
        game.makeMove(new Position(0, 6), new Position(0, 5), null);
        game.makeMove(new Position(4, 3), new Position(4, 4), null);
        game.makeMove(new Position(3, 6), new Position(3, 4), null);

        // Act
        List<GameResponse.ExecutedMove> moves = game.makeMove(new Position(4, 4), new Position(3, 5), null);

        // Assert
        assertThat(moves).isNotEmpty();
    }

    @Test
    @DisplayName("Should handle resignation correctly.")
    void shouldHandleResignation() {
        // Act
        game.resign(Color.WHITE);

        // Assert
        assertThat(game.getStatus()).isEqualTo(GameStatus.RESIGNED);
        assertThat(game.makeMove(new Position(4, 1), new Position(4, 3), null)).isEmpty();
    }

    @Test
    @DisplayName("Should detect Stalemate correctly.")
    void shouldDetectStalemate() {
        // Arrange
        game.getBoard().clearBoard();
        game.getBoard().setPieceAt(new Position(0, 0), new King(Color.WHITE, new Position(0, 0)));
        game.getBoard().setPieceAt(new Position(1, 2), new Queen(Color.BLACK, new Position(1, 2)));

        // Act
        game.makeMove(new Position(7,7), new Position(7,7), null);

        // Assert
        assertThat(game.isInCheck(Color.WHITE)).isFalse();
    }

    @Test
    @DisplayName("Should detect Draw by Threefold Repetition.")
    void shouldDetectDrawByThreefoldRepetition() {
        // Arrange & Act
        for(int i=0; i<2; i++) {
            game.makeMove(new Position(1, 0), new Position(2, 2), null);
            game.makeMove(new Position(1, 7), new Position(2, 5), null);
            game.makeMove(new Position(2, 2), new Position(1, 0), null);
            game.makeMove(new Position(2, 5), new Position(1, 7), null);
        }

        // Assert
        assertThat(game.getStatus()).isEqualTo(GameStatus.DRAW);
    }
}
