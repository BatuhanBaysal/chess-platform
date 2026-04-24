package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Technical test suite for MoveExecutor.
 * Validates the atomic execution of chess moves including complex special rules.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Move Executor Professional Test Suite")
class MoveExecutorTest {

    private MoveExecutor executor;
    private Board board;

    @Mock
    private MoveValidator validator;

    @BeforeEach
    void setUp() {
        executor = new MoveExecutor();
        board = new Board(false);
    }

    @Nested
    @DisplayName("Standard Movement")
    class StandardMoveTests {

        @Test
        @DisplayName("Should update board state and piece flags for a standard move")
        void shouldExecuteStandardMoveSuccessfully() {
            // Arrange
            Position start = new Position(4, 1); // e2
            Position end = new Position(4, 2);   // e3
            Piece pawn = new Pawn(Color.WHITE, start);
            board.setPieceAt(start, pawn);

            // Stubbing
            lenient().when(validator.isCastlingAttempt(any(), any(), any())).thenReturn(false);
            lenient().when(validator.isEnPassantAttempt(any(), any(), any())).thenReturn(false);
            lenient().when(validator.isPromotionSituation(any(), any())).thenReturn(false);

            // Act
            executor.execute(start, end, pawn, null, board, validator);

            // Assert
            assertThat(board.getPiece(start)).isEmpty();
            assertThat(board.getPiece(end)).isPresent().contains(pawn);
            assertThat(pawn.hasMoved()).as("Piece's internal moved flag must be true").isTrue();
        }
    }

    @Nested
    @DisplayName("Special Move Scenarios")
    class SpecialMoveTests {

        @Test
        @DisplayName("Should execute Kingside Castling and move the Rook correctly")
        void shouldExecuteKingsideCastling() {
            // Arrange
            Position kingStart = new Position(4, 0);
            Position kingEnd = new Position(6, 0);
            Position rookStart = new Position(7, 0);
            Position rookEnd = new Position(5, 0);

            King king = new King(Color.WHITE, kingStart);
            Rook rook = new Rook(Color.WHITE, rookStart);

            board.setPieceAt(kingStart, king);
            board.setPieceAt(rookStart, rook);

            when(validator.isCastlingAttempt(eq(king), any(), eq(kingEnd))).thenReturn(true);

            // Act
            executor.execute(kingStart, kingEnd, king, null, board, validator);

            // Assert
            assertThat(board.getPiece(kingEnd)).isPresent().contains(king);
            assertThat(board.getPiece(rookEnd)).isPresent().contains(rook);
        }

        @Test
        @DisplayName("Should execute En Passant and remove the captured pawn")
        void shouldExecuteEnPassantCapture() {
            // Arrange
            Position whiteStart = new Position(4, 4); // e5
            Position blackPos = new Position(5, 4);   // f5
            Position target = new Position(5, 5);     // f6

            Pawn whitePawn = new Pawn(Color.WHITE, whiteStart);
            Pawn blackPawn = new Pawn(Color.BLACK, blackPos);

            board.setPieceAt(whiteStart, whitePawn);
            board.setPieceAt(blackPos, blackPawn);

            when(validator.isEnPassantAttempt(eq(whitePawn), any(), eq(board))).thenReturn(true);

            // Act
            executor.execute(whiteStart, target, whitePawn, null, board, validator);

            // Assert
            assertThat(board.getPiece(blackPos)).as("Captured pawn must be removed").isEmpty();
            assertThat(board.getPiece(target)).isPresent().contains(whitePawn);
        }
    }
}
