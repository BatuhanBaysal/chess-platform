package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MoveValidator Logic Tests")
class MoveValidatorTest {

    private MoveValidator validator;
    private Board board;
    private final Color white = Color.WHITE;
    private final Color black = Color.BLACK;

    @BeforeEach
    void setUp() {
        validator = new MoveValidator();
        board = new Board(false);
    }

    @Nested
    @DisplayName("Move Legality & King Safety")
    class LegalityAndSafetyTests {

        @Test
        @DisplayName("Should reject move when starting square does not contain a piece")
        void shouldRejectMove_WhenStartSquareIsEmpty() {
            // Arrange
            Position emptyStart = new Position(4, 1);
            Position target = new Position(4, 2);

            // Act
            boolean result = validator.isMoveLegal(emptyStart, target, board, white, null);

            // Assert
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("Should prohibit moving a piece pinned to the King")
        void shouldProhibitMove_WhenPieceIsPinnedToKing() {
            // Arrange
            Position kingPos = new Position(4, 0);
            Position pinnedPawnPos = new Position(4, 1);
            Position enemyRookPos = new Position(4, 7);

            board.setPieceAt(kingPos, new King(white, kingPos));
            board.setPieceAt(pinnedPawnPos, new Pawn(white, pinnedPawnPos));
            board.setPieceAt(enemyRookPos, new Rook(black, enemyRookPos));

            // Act
            boolean result = validator.isMoveLegal(pinnedPawnPos, new Position(3, 1), board, white, null);

            // Assert
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("Should prevent en passant capture if it exposes King to discovered check")
        void shouldPreventEnPassant_WhenExposesKingToDiscoveredCheck() {
            // Arrange
            Position kingPos = new Position(0, 4);
            Position myPawnPos = new Position(4, 4);
            Position enemyPawnEnd = new Position(3, 4);
            Position enemyRookPos = new Position(7, 4);

            board.setPieceAt(kingPos, new King(white, kingPos));
            board.setPieceAt(myPawnPos, new Pawn(white, myPawnPos));
            board.setPieceAt(enemyPawnEnd, new Pawn(black, enemyPawnEnd));
            board.setPieceAt(enemyRookPos, new Rook(black, enemyRookPos));

            // Act
            boolean result = validator.isMoveSafe(myPawnPos, new Position(3, 5), new Pawn(white, myPawnPos), board, white);

            // Assert
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("Castling Rules")
    class CastlingTests {

        @Test
        @DisplayName("Should permit castling when trajectory is clear, safe, and pieces have not moved")
        void shouldPermitCastling_WhenConditionsAreMet() {
            // Arrange
            Position kingPos = new Position(4, 0);
            Position rookPos = new Position(7, 0);
            board.setPieceAt(kingPos, new King(white, kingPos));
            board.setPieceAt(rookPos, new Rook(white, rookPos));

            // Act
            boolean result = validator.canCastle(kingPos, new Position(6, 0), board, white);

            // Assert
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("Should deny castling when King is currently in check")
        void shouldDenyCastling_WhenKingIsInCheck() {
            // Arrange
            Position kingPos = new Position(4, 0);
            Position rookPos = new Position(7, 0);
            Position enemyRookPos = new Position(4, 7);

            board.setPieceAt(kingPos, new King(white, kingPos));
            board.setPieceAt(rookPos, new Rook(white, rookPos));
            board.setPieceAt(enemyRookPos, new Rook(black, enemyRookPos));

            // Act
            boolean result = validator.canCastle(kingPos, new Position(6, 0), board, white);

            // Assert
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("Should deny castling if King passes through an attacked square")
        void shouldDenyCastling_WhenKingTransitSquareIsUnderAttack() {
            // Arrange
            Position kingPos = new Position(4, 0);
            board.setPieceAt(kingPos, new King(white, kingPos));
            board.setPieceAt(new Position(7, 0), new Rook(white, new Position(7, 0)));
            board.setPieceAt(new Position(5, 7), new Rook(black, new Position(5, 7)));

            // Act
            boolean result = validator.canCastle(kingPos, new Position(6, 0), board, white);

            // Assert
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("Should deny queenside castling if Knight square (b1/b8) is occupied")
        void shouldDenyQueensideCastling_WhenKnightSquareIsOccupied() {
            // Arrange
            Position kingPos = new Position(4, 0);
            Position rookPos = new Position(0, 0);
            Position b1Pos = new Position(1, 0);

            board.setPieceAt(kingPos, new King(white, kingPos));
            board.setPieceAt(rookPos, new Rook(white, rookPos));
            board.setPieceAt(b1Pos, new Knight(white, b1Pos));

            // Act
            boolean result = validator.canCastle(kingPos, new Position(2, 0), board, white);

            // Assert
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("Should deny castling when Rook has already moved")
        void shouldDenyCastling_WhenRookHasMoved() {
            // Arrange
            Position kingPos = new Position(4, 0);
            Position rookPos = new Position(7, 0);
            Rook rook = new Rook(white, rookPos);
            rook.setHasMoved(true);

            board.setPieceAt(kingPos, new King(white, kingPos));
            board.setPieceAt(rookPos, rook);

            // Act
            boolean result = validator.canCastle(kingPos, new Position(6, 0), board, white);

            // Assert
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("En Passant Validation")
    class EnPassantTests {

        @Test
        @DisplayName("Should permit en passant following opponent double-square pawn advance")
        void shouldPermitEnPassant_WhenPrecededByDoubleStepPawnAdvance() {
            // Arrange
            Position myPawnPos = new Position(4, 4);
            Position enemyPawnStart = new Position(5, 6);
            Position enemyPawnEnd = new Position(5, 4);
            Pawn enemyPawn = new Pawn(black, enemyPawnEnd);

            board.setPieceAt(myPawnPos, new Pawn(white, myPawnPos));
            board.setPieceAt(enemyPawnEnd, enemyPawn);

            Game.Move lastMove = new Game.Move(enemyPawnStart, enemyPawnEnd, enemyPawn);

            // Act
            boolean result = validator.canEnPassant(myPawnPos, new Position(5, 5), lastMove, white);

            // Assert
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("Should deny en passant if opponent pawn moved only a single square")
        void shouldDenyEnPassant_WhenPrecededBySingleStepPawnAdvance() {
            // Arrange
            Position myPawnPos = new Position(4, 4);
            Position enemyPawnStart = new Position(5, 5);
            Position enemyPawnEnd = new Position(5, 4);
            Pawn enemyPawn = new Pawn(black, enemyPawnEnd);

            Game.Move lastMove = new Game.Move(enemyPawnStart, enemyPawnEnd, enemyPawn);

            // Act
            boolean result = validator.canEnPassant(myPawnPos, new Position(5, 5), lastMove, white);

            // Assert
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("Should return false when last move is null or piece is not a pawn")
        void shouldReturnFalse_WhenLastMoveIsNotPawn() {
            // Arrange
            Position myPawnPos = new Position(4, 4);
            Position knightStart = new Position(1, 0);
            Position knightEnd = new Position(2, 2);
            Knight knight = new Knight(black, knightEnd);

            Game.Move lastMove = new Game.Move(knightStart, knightEnd, knight);

            // Act
            boolean nullMoveResult = validator.canEnPassant(myPawnPos, new Position(5, 5), null, white);
            boolean knightMoveResult = validator.canEnPassant(myPawnPos, new Position(5, 5), lastMove, white);

            // Assert
            assertThat(nullMoveResult).isFalse();
            assertThat(knightMoveResult).isFalse();
        }
    }

    @Nested
    @DisplayName("Promotion & Square Inquiries")
    class PromotionAndSquareInquiriesTests {

        @ParameterizedTest
        @ValueSource(strings = {"QUEEN", "ROOK", "BISHOP", "KNIGHT", "Q", "R", "B", "N"})
        @DisplayName("Should validate move when promotion type is a legal target piece")
        void shouldValidateMove_WhenPromotionTypeIsLegal(String promotionType) {
            // Arrange
            Position start = new Position(0, 6);
            Position end = new Position(0, 7);
            Pawn pawn = new Pawn(white, start);
            board.setPieceAt(start, pawn);
            board.setPieceAt(new Position(4, 0), new King(white, new Position(4, 0)));

            // Act
            boolean result = validator.isMoveLegal(start, end, board, white, null, promotionType);

            // Assert
            assertThat(result).isTrue();
        }

        @ParameterizedTest
        @ValueSource(strings = {"KING", "PAWN", "INVALID"})
        @DisplayName("Should reject move when promotion type is illegal")
        void shouldRejectMove_WhenPromotionTypeIsIllegal(String invalidPromotionType) {
            // Arrange
            Position start = new Position(0, 6);
            Position end = new Position(0, 7);
            Pawn pawn = new Pawn(white, start);
            board.setPieceAt(start, pawn);
            board.setPieceAt(new Position(4, 0), new King(white, new Position(4, 0)));

            // Act
            boolean result = validator.isMoveLegal(start, end, board, white, null, invalidPromotionType);

            // Assert
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("Should detect square under attack by enemy Knight")
        void shouldDetectSquareAttacked_ByEnemyKnight() {
            // Arrange
            Position target = new Position(4, 4);
            Position knightPos = new Position(3, 2);
            board.setPieceAt(knightPos, new Knight(black, knightPos));

            // Act
            boolean result = validator.isSquareAttacked(target, black, board);

            // Assert
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("Should confirm promotion situation when Pawn reaches opposing back rank")
        void shouldConfirmPromotionSituation_WhenPawnReachesFinalRank() {
            // Arrange
            Position endPos = new Position(0, 7);
            Pawn whitePawn = new Pawn(white, new Position(0, 6));

            // Act
            boolean result = validator.isPromotionSituation(whitePawn, endPos);

            // Assert
            assertThat(result).isTrue();
        }
    }
}
