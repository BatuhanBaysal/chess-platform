package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Game Domain Orchestrator Tests")
class GameTest {

    private Game game;

    @BeforeEach
    void setUp() {
        game = new Game(new Board(true));
        game.startClock(10);
    }

    @Nested
    @DisplayName("Turn & Core State")
    class TurnTests {

        @Test
        @DisplayName("Should initialize with White turn, ACTIVE status, and full board history")
        void shouldInitializeCorrectly() {
            // Act & Assert
            assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
            assertThat(game.getStatus()).isEqualTo(GameStatus.ACTIVE);
            assertThat(game.getBoardHistory()).isNotEmpty();
        }

        @Test
        @DisplayName("Should alternate turn to Black after valid White move")
        void shouldSwitchTurn_WhenMoveIsValid() {
            // Arrange
            Position start = new Position(4, 1);
            Position end = new Position(4, 3);

            // Act
            List<Game.ExecutedMoveData> moves = game.makeMove(start, end, null);

            // Assert
            assertThat(moves).isNotEmpty();
            assertThat(game.getCurrentTurn()).isEqualTo(Color.BLACK);
        }

        @Test
        @DisplayName("Should reject moves made out of turn")
        void shouldRejectMove_WhenOutOfTurn() {
            // Arrange
            Position start = new Position(4, 6);
            Position end = new Position(4, 4);

            // Act
            List<Game.ExecutedMoveData> moves = game.makeMove(start, end, null);

            // Assert
            assertThat(moves).isEmpty();
            assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
        }

        @Test
        @DisplayName("Should identify AI game when white or black player ID is -1")
        void shouldIdentifyAiGame_WhenPlayerIdIsMinusOne() {
            // Arrange & Act
            game.setWhitePlayerId(10L);
            game.setBlackPlayerId(-1L);

            // Assert
            assertThat(game.isAiGame()).isTrue();
        }

        @Test
        @DisplayName("Should return legal move targets for selected square")
        void shouldReturnLegalMoves_ForSelectedPiece() {
            // Arrange
            Position pawnStart = new Position(4, 1);

            // Act
            List<Position> legalMoves = game.getLegalMovesForSquare(pawnStart);

            // Assert
            assertThat(legalMoves)
                .containsExactlyInAnyOrder(new Position(4, 2), new Position(4, 3));
        }
    }

    @Nested
    @DisplayName("Special Moves")
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
            List<Game.ExecutedMoveData> moves = game.makeMove(kingStart, new Position(6, 0), null);

            // Assert
            assertThat(moves).hasSize(2);
            assertThat(game.getBoard().getPiece(new Position(6, 0))).isPresent();
            assertThat(game.getBoard().getPiece(new Position(5, 0))).isPresent();
        }

        @Test
        @DisplayName("Should execute En Passant and remove the captured pawn")
        void shouldExecuteEnPassant() {
            // Arrange
            game.makeMove(new Position(4, 1), new Position(4, 3), null);
            game.makeMove(new Position(0, 6), new Position(0, 5), null);
            game.makeMove(new Position(4, 3), new Position(4, 4), null);
            game.makeMove(new Position(3, 6), new Position(3, 4), null);

            // Act
            List<Game.ExecutedMoveData> moves = game.makeMove(new Position(4, 4), new Position(3, 5), null);

            // Assert
            assertThat(moves).isNotEmpty();
            assertThat(game.getBoard().getPiece(new Position(3, 4))).isEmpty();
        }
    }

    @Nested
    @DisplayName("Game Ending Conditions")
    class GameEndingTests {

        @Test
        @DisplayName("Should detect Checkmate on Scholar's/Fool's mate sequence")
        void shouldDetectCheckmate() {
            // Arrange
            game.makeMove(new Position(5, 1), new Position(5, 2), null);
            game.makeMove(new Position(4, 6), new Position(4, 4), null);
            game.makeMove(new Position(6, 1), new Position(6, 3), null);

            // Act
            game.makeMove(new Position(3, 7), new Position(7, 3), null);

            // Assert
            assertThat(game.getStatus()).isEqualTo(GameStatus.CHECKMATE);
            assertThat(game.getLastMoveMessage()).contains("CHECKMATE!");
        }

        @Test
        @DisplayName("Should set TIMEOUT status when remaining time drops to zero")
        void shouldSetTimeout_WhenRemainingTimeIsZero() {
            // Arrange
            game.setRemainingTimes(0, 5000);

            // Act
            List<Game.ExecutedMoveData> moves = game.makeMove(new Position(4, 1), new Position(4, 3), null);

            // Assert
            assertThat(moves).isEmpty();
            assertThat(game.getStatus()).isEqualTo(GameStatus.TIMEOUT);
        }

        @Test
        @DisplayName("Should detect Draw by Threefold Repetition")
        void shouldDetectThreefoldRepetition() {
            // Arrange
            for (int i = 0; i < 3; i++) {
                game.makeMove(new Position(1, 0), new Position(2, 2), null);
                game.makeMove(new Position(1, 7), new Position(2, 5), null);
                game.makeMove(new Position(2, 2), new Position(1, 0), null);
                game.makeMove(new Position(2, 5), new Position(1, 7), null);
            }

            // Assert
            assertThat(game.getStatus()).isEqualTo(GameStatus.DRAW);
        }
    }
}
