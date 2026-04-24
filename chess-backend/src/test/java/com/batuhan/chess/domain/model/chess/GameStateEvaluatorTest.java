package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * GameStateEvaluator Test Suite.
 * Validates complex chess rules including Checkmate, Stalemate, 50-move rule,
 * Threefold Repetition, and Insufficient Material.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GameStateEvaluator - Professional Coverage Suite")
class GameStateEvaluatorTest {

    private GameStateEvaluator evaluator;

    @Mock private Board board;
    @Mock private MoveValidator validator;

    private final Position defaultPos = new Position(0, 0);
    private final Color white = Color.WHITE;
    private final Color black = Color.BLACK;

    @BeforeEach
    void setUp() {
        evaluator = new GameStateEvaluator();
    }

    @Nested
    @DisplayName("Check & Checkmate Scenarios")
    class CheckScenarios {

        @Test
        @DisplayName("Should return CHECK when king is under attack but has legal responses")
        void shouldReturnCheckWhenEscapable() {
            // Arrange
            setupLegalMoveMocking(true);
            when(validator.isInCheck(white, board)).thenReturn(true);

            // Act
            GameStatus status = evaluator.evaluateStatus(board, white, validator, 0, new ArrayList<>(), null);

            // Assert
            assertThat(status).as("Game must continue in CHECK if legal moves exist").isEqualTo(GameStatus.CHECK);
        }

        @Test
        @DisplayName("Should return CHECKMATE when king is under attack and no legal moves exist")
        void shouldReturnCheckmateWhenTrapped() {
            // Arrange
            setupLegalMoveMocking(false);
            when(validator.isInCheck(white, board)).thenReturn(true);

            // Act
            GameStatus status = evaluator.evaluateStatus(board, white, validator, 0, new ArrayList<>(), null);

            // Assert
            assertThat(status).as("No escape routes should result in CHECKMATE").isEqualTo(GameStatus.CHECKMATE);
        }
    }

    @Nested
    @DisplayName("Draw & Stalemate Scenarios")
    class DrawScenarios {

        @Test
        @DisplayName("Should return STALEMATE when no legal moves exist but king is safe")
        void shouldReturnStalemateWhenKingIsSafeButBlocked() {
            // Arrange
            setupLegalMoveMocking(false);
            when(validator.isInCheck(white, board)).thenReturn(false);

            // Act
            GameStatus status = evaluator.evaluateStatus(board, white, validator, 0, new ArrayList<>(), null);

            // Assert
            assertThat(status).isEqualTo(GameStatus.STALEMATE);
        }

        @Test
        @DisplayName("Should return DRAW when 50-move rule threshold is met")
        void shouldReturnDrawByFiftyMoveRule() {
            // Arrange
            setupLegalMoveMocking(true);
            when(validator.isInCheck(white, board)).thenReturn(false);
            int halfMoveClock = 100; // 50 moves for both sides

            // Act
            GameStatus status = evaluator.evaluateStatus(board, white, validator, halfMoveClock, new ArrayList<>(), null);

            // Assert
            assertThat(status).isEqualTo(GameStatus.DRAW);
        }

        @Test
        @DisplayName("Should return DRAW when the current board state has occurred three times")
        void shouldReturnDrawByThreefoldRepetition() {
            // Arrange
            setupLegalMoveMocking(true);
            when(validator.isInCheck(white, board)).thenReturn(false);
            when(board.toString()).thenReturn("boardState");

            String state = "boardState|WHITE";
            List<String> history = Arrays.asList(state, state, "differentState", state);

            // Act
            GameStatus status = evaluator.evaluateStatus(board, white, validator, 0, history, null);

            // Assert
            assertThat(status).isEqualTo(GameStatus.DRAW);
        }
    }

    @Nested
    @DisplayName("Insufficient Material Logic")
    class MaterialScenarios {

        @Test
        @DisplayName("Should return DRAW for King vs King scenarios")
        void shouldReturnDrawForBareKings() {
            // Arrange
            setupLegalMoveMocking(true);
            List<Piece> pieces = List.of(new King(white, defaultPos), new King(black, defaultPos));
            when(board.findAllPieces()).thenReturn(pieces);

            // Act
            GameStatus status = evaluator.evaluateStatus(board, white, validator, 0, new ArrayList<>(), null);

            // Assert
            assertThat(status).isEqualTo(GameStatus.DRAW);
        }

        @Test
        @DisplayName("Should return DRAW for King + Knight vs King")
        void shouldReturnDrawForKingAndKnight() {
            // Arrange
            setupLegalMoveMocking(true);
            List<Piece> pieces = List.of(
                new King(white, defaultPos),
                new King(black, defaultPos),
                new Knight(white, defaultPos)
            );
            when(board.findAllPieces()).thenReturn(pieces);

            // Act
            GameStatus status = evaluator.evaluateStatus(board, white, validator, 0, new ArrayList<>(), null);

            // Assert
            assertThat(status).isEqualTo(GameStatus.DRAW);
        }
    }

    private void setupLegalMoveMocking(boolean isLegal) {
        Pawn dummyPawn = new Pawn(white, defaultPos);
        when(board.findPiecesByColor(white)).thenReturn(List.of(dummyPawn));
        when(validator.isMoveLegal(eq(defaultPos), any(), eq(board), eq(white), any()))
            .thenReturn(isLegal);
    }
}
