package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MoveExecutor Domain Tests")
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
    @DisplayName("Standard Execution")
    class StandardMoveTests {

        @Test
        @DisplayName("Should update piece position and set hasMoved flag when standard move executes")
        void shouldUpdatePositionAndFlag_WhenStandardMoveOccurs() {
            // Arrange
            Position start = new Position(4, 1);
            Position end = new Position(4, 2);
            Piece pawn = new Pawn(Color.WHITE, start);
            board.setPieceAt(start, pawn);

            lenient().when(validator.isCastlingAttempt(pawn, start, end)).thenReturn(false);
            lenient().when(validator.isEnPassantAttempt(pawn, end, board)).thenReturn(false);
            lenient().when(validator.isPromotionSituation(pawn, end)).thenReturn(false);

            // Act
            executor.execute(start, end, pawn, null, board, validator);

            // Assert
            assertThat(board.getPiece(start)).isEmpty();
            assertThat(board.getPiece(end)).contains(pawn);
            assertThat(pawn.hasMoved()).isTrue();
        }
    }

    @Nested
    @DisplayName("Special Moves Execution")
    class SpecialMoveTests {

        @Test
        @DisplayName("Should reposition both King and Rook when castling executes")
        void shouldMoveKingAndRook_WhenCastlingOccurs() {
            // Arrange
            Position kingStart = new Position(4, 0);
            Position kingEnd = new Position(6, 0);
            Position rookStart = new Position(7, 0);
            Position rookEnd = new Position(5, 0);

            King king = new King(Color.WHITE, kingStart);
            Rook rook = new Rook(Color.WHITE, rookStart);

            board.setPieceAt(kingStart, king);
            board.setPieceAt(rookStart, rook);

            when(validator.isCastlingAttempt(king, kingStart, kingEnd)).thenReturn(true);

            // Act
            executor.execute(kingStart, kingEnd, king, null, board, validator);

            // Assert
            assertThat(board.getPiece(kingEnd)).contains(king);
            assertThat(board.getPiece(rookEnd)).contains(rook);
            assertThat(board.getPiece(kingStart)).isEmpty();
            assertThat(board.getPiece(rookStart)).isEmpty();
        }

        @Test
        @DisplayName("Should clear captured pawn from board when en passant executes")
        void shouldClearEnemyPawn_WhenEnPassantOccurs() {
            // Arrange
            Position whiteStart = new Position(4, 4);
            Position blackPos = new Position(5, 4);
            Position target = new Position(5, 5);

            Pawn whitePawn = new Pawn(Color.WHITE, whiteStart);
            Pawn blackPawn = new Pawn(Color.BLACK, blackPos);

            board.setPieceAt(whiteStart, whitePawn);
            board.setPieceAt(blackPos, blackPawn);

            when(validator.isEnPassantAttempt(whitePawn, target, board)).thenReturn(true);

            // Act
            executor.execute(whiteStart, target, whitePawn, null, board, validator);

            // Assert
            assertThat(board.getPiece(blackPos)).isEmpty();
            assertThat(board.getPiece(target)).contains(whitePawn);
        }

        @Test
        @DisplayName("Should replace pawn with promoted piece on target square when promotion executes")
        void shouldPromotePawn_WhenPromotionSituationOccurs() {
            // Arrange
            Position start = new Position(0, 6);
            Position end = new Position(0, 7);
            Pawn pawn = new Pawn(Color.WHITE, start);
            board.setPieceAt(start, pawn);

            when(validator.isPromotionSituation(pawn, end)).thenReturn(true);

            // Act
            executor.execute(start, end, pawn, "QUEEN", board, validator);

            // Assert
            assertThat(board.getPiece(start)).isEmpty();
            assertThat(board.getPiece(end))
                .isPresent()
                .hasValueSatisfying(promoted -> {
                    assertThat(promoted.getType()).isEqualTo(PieceType.QUEEN);
                    assertThat(promoted.getColor()).isEqualTo(Color.WHITE);
                    assertThat(promoted.hasMoved()).isTrue();
                });
        }
    }
}
