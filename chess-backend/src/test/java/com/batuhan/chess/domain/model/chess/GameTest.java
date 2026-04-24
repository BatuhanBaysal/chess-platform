package com.batuhan.chess.domain.model.chess;

import com.batuhan.chess.api.dto.game.GameResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integrated Unit Tests for the Game Orchestrator.
 * Covers turn management, move execution, special rules, and game state transitions.
 */
@DisplayName("Game Domain Orchestrator Tests")
class GameTest {

    private Game game;

    @BeforeEach
    void setUp() {
        game = new Game(new Board(true));
    }

    @Nested
    @DisplayName("Turn & Core State Management")
    class TurnTests {

        @Test
        @DisplayName("Should initialize with White turn and ACTIVE status")
        void shouldInitializeCorrectly() {
            assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
            assertThat(game.getStatus()).isEqualTo(GameStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should switch turn after a valid move")
        void shouldSwitchTurnAfterValidMove() {
            // Arrange
            Position start = new Position(4, 1);
            Position end = new Position(4, 3);

            // Act
            List<GameResponse.ExecutedMove> moves = game.makeMove(start, end, null);

            // Assert
            assertThat(moves).isNotEmpty();
            assertThat(game.getCurrentTurn()).as("Turn must switch to Black").isEqualTo(Color.BLACK);
        }

        @Test
        @DisplayName("Should block moves made out of turn")
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
    }

    @Nested
    @DisplayName("Special Moves: Castling & En Passant")
    class SpecialMoveTests {

        @Test
        @DisplayName("Should execute Kingside Castling and return both King and Rook moves")
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
            assertThat(moves).as("Castling involves two pieces moving").hasSize(2);
            assertThat(game.getBoard().getPiece(new Position(6, 0))).isPresent(); // King
            assertThat(game.getBoard().getPiece(new Position(5, 0))).isPresent(); // Rook
        }

        @Test
        @DisplayName("Should execute En Passant and remove the captured pawn")
        void shouldExecuteEnPassant() {
            // Arrange
            game.makeMove(new Position(4, 1), new Position(4, 3), null); // White e4
            game.makeMove(new Position(0, 6), new Position(0, 5), null); // Black a6
            game.makeMove(new Position(4, 3), new Position(4, 4), null); // White e5
            game.makeMove(new Position(3, 6), new Position(3, 4), null); // Black d5 (Two square jump)

            // Act
            List<GameResponse.ExecutedMove> moves = game.makeMove(new Position(4, 4), new Position(3, 5), null);

            // Assert
            assertThat(moves).isNotEmpty();
            assertThat(game.getBoard().getPiece(new Position(3, 4))).isEmpty();
        }
    }

    @Nested
    @DisplayName("Game Ending & Checkmate Logic")
    class GameEndingTests {

        @Test
        @DisplayName("Should detect Checkmate (Fool's Mate)")
        void shouldDetectCheckmate() {
            game.makeMove(new Position(5, 1), new Position(5, 2), null); // f3
            game.makeMove(new Position(4, 6), new Position(4, 4), null); // e5
            game.makeMove(new Position(6, 1), new Position(6, 3), null); // g4
            game.makeMove(new Position(3, 7), new Position(7, 3), null); // Qh4#

            // Assert
            assertThat(game.getStatus()).isEqualTo(GameStatus.CHECKMATE);
            assertThat(game.getLastMoveMessage()).isEqualTo("CHECKMATE!");
        }

        @Test
        @DisplayName("Should detect Stalemate when no legal moves are available but not in check")
        void shouldDetectStalemate() {
            // Arrange
            game.getBoard().clearBoard();
            Position whiteKingPos = new Position(0, 0);
            game.getBoard().setPieceAt(whiteKingPos, new King(Color.WHITE, whiteKingPos));
            game.getBoard().setPieceAt(new Position(1, 2), new Queen(Color.BLACK, new Position(1, 2)));

            // Act
            GameStatus status = game.getEvaluator().evaluateStatus(
                game.getBoard(), Color.WHITE, game.getValidator(),
                game.getHalfMoveClock(), game.getBoardHistory(), game.getLastMove()
            );

            // Assert
            assertThat(status).isEqualTo(GameStatus.STALEMATE);
        }
    }

    @Nested
    @DisplayName("Draw Metrics & Fifty-Move Rule")
    class DrawMetricTests {

        @Test
        @DisplayName("Should reset Fifty-Move clock and history on pawn moves")
        void shouldResetClockOnPawnMove() {
            // Arrange
            game.setHalfMoveClock(10);
            Position pawnStart = new Position(4, 1);
            Position pawnEnd = new Position(4, 2);

            // Act
            game.makeMove(pawnStart, pawnEnd, null);

            // Assert
            assertThat(game.getHalfMoveClock()).isZero();
            assertThat(game.getBoardHistory()).hasSize(1);
        }

        @Test
        @DisplayName("Should detect Draw by Threefold Repetition")
        void shouldDetectThreefoldRepetition() {
            // Act
            for(int i = 0; i < 2; i++) {
                game.makeMove(new Position(1, 0), new Position(2, 2), null); // b1-c3
                game.makeMove(new Position(1, 7), new Position(2, 5), null); // b8-c6
                game.makeMove(new Position(2, 2), new Position(1, 0), null); // c3-b1
                game.makeMove(new Position(2, 5), new Position(1, 7), null); // c6-b8
            }
            game.makeMove(new Position(1, 0), new Position(2, 2), null);

            // Assert
            assertThat(game.getStatus()).isEqualTo(GameStatus.DRAW);
        }
    }
}
