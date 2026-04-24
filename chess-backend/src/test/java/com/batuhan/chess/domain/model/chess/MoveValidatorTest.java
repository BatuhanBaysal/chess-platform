package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MoveValidator Professional Test Suite.
 * Validates complex rules: Pinning, Castling, En Passant, and Square Safety.
 */
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
    @DisplayName("Safety & Pinning Logic")
    class SafetyTests {

        @Test
        @DisplayName("Should prohibit moving a piece pinned to the King")
        void isMoveLegal_PinnedPiece_ReturnsFalse() {
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
            assertThat(result).as("Move must be illegal as it exposes the King to vertical check").isFalse();
        }

        @Test
        @DisplayName("isMoveSafe: should prevent en passant if it results in a discovered check")
        void isMoveSafe_EnPassantExposesKing_ReturnsFalse() {
            // Arrange
            Position kingPos = new Position(0, 4); // a5
            Position myPawnPos = new Position(4, 4); // e5
            Position enemyPawnEnd = new Position(3, 4); // d5
            Position enemyRookPos = new Position(7, 4); // h5

            board.setPieceAt(kingPos, new King(white, kingPos));
            board.setPieceAt(myPawnPos, new Pawn(white, myPawnPos));
            board.setPieceAt(enemyPawnEnd, new Pawn(black, enemyPawnEnd));
            board.setPieceAt(enemyRookPos, new Rook(black, enemyRookPos));

            // Act
            boolean result = validator.isMoveSafe(myPawnPos, new Position(3, 5), new Pawn(white, myPawnPos), board, white);

            // Assert
            assertThat(result).as("En passant should be unsafe if rank h5-a5 becomes clear for the rook").isFalse();
        }
    }

    @Nested
    @DisplayName("Castling Rules")
    class CastlingTests {

        @Test
        @DisplayName("Should allow castling when path is clear, safe, and pieces haven't moved")
        void canCastle_ValidKingside_ReturnsTrue() {
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
        @DisplayName("Should deny castling if King must pass through an attacked square")
        void canCastle_PathUnderAttack_ReturnsFalse() {
            // Arrange
            Position kingPos = new Position(4, 0);
            board.setPieceAt(kingPos, new King(white, kingPos));
            board.setPieceAt(new Position(7, 0), new Rook(white, new Position(7, 0)));
            board.setPieceAt(new Position(5, 7), new Rook(black, new Position(5, 7)));

            // Act
            boolean result = validator.canCastle(kingPos, new Position(6, 0), board, white);

            // Assert
            assertThat(result).as("King cannot castle through the f1 square which is under attack").isFalse();
        }

        @Test
        @DisplayName("Should deny castling if the Rook has already moved")
        void canCastle_RookHasMoved_ReturnsFalse() {
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
    @DisplayName("En Passant Detection")
    class EnPassantTests {

        @Test
        @DisplayName("Should validate En Passant after opponent's two-square pawn jump")
        void canEnPassant_ValidScenario_ReturnsTrue() {
            // Arrange
            Position myPawnPos = new Position(4, 4); // e5
            Position enemyPawnStart = new Position(5, 6); // f7
            Position enemyPawnEnd = new Position(5, 4); // f5
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
        @DisplayName("Should deny En Passant if the opponent's pawn only moved one square")
        void canEnPassant_SingleStepLastMove_ReturnsFalse() {
            // Arrange
            Position myPawnPos = new Position(4, 4);
            Position enemyPawnStart = new Position(5, 5); // f6
            Position enemyPawnEnd = new Position(5, 4); // f5
            Pawn enemyPawn = new Pawn(black, enemyPawnEnd);

            Game.Move lastMove = new Game.Move(enemyPawnStart, enemyPawnEnd, enemyPawn);

            // Act
            boolean result = validator.canEnPassant(myPawnPos, new Position(5, 5), lastMove, white);

            // Assert
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("Square Utility Methods")
    class UtilityTests {

        @Test
        @DisplayName("isSquareAttacked: should detect attack from enemy Knight")
        void isSquareAttacked_ByKnight_ReturnsTrue() {
            // Arrange
            Position target = new Position(4, 4); // e5
            Position knightPos = new Position(3, 2); // d3
            board.setPieceAt(knightPos, new Knight(black, knightPos));

            // Act
            boolean result = validator.isSquareAttacked(target, black, board);

            // Assert
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("isPromotionSituation: should detect Pawn reaching the final rank")
        void isPromotionSituation_DetectsEndRank() {
            // Arrange
            Position endPos = new Position(0, 7); // a8
            Pawn whitePawn = new Pawn(white, new Position(0, 6));

            // Act
            boolean result = validator.isPromotionSituation(whitePawn, endPos);

            // Assert
            assertThat(result).isTrue();
        }
    }
}
