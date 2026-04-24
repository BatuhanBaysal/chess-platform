package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotSame;

/**
 * Technical test suite for the Chess Board.
 * Validates the 8x8 grid structure, standard piece placement,
 * deep copying mechanisms, and internal consistency.
 */
@DisplayName("Board Unified Professional Test Suite")
class BoardTest {

    private Board board;

    @BeforeEach
    void setUp() {
        board = new Board(true);
    }

    @Nested
    @DisplayName("Board Initialization & Setup")
    class InitializationTests {

        @Test
        @DisplayName("Should verify board dimensions and initial piece counts")
        void shouldVerifyInitialCounts() {
            // Act & Assert
            assertThat(board.getSquares()).as("Board must be an 8x8 grid").hasDimensions(8, 8);

            assertThat(board.findAllPieces())
                .as("Initial board must contain exactly 32 pieces")
                .hasSize(32);

            assertThat(board.findPiecesByColor(Color.WHITE)).hasSize(16);
            assertThat(board.findPiecesByColor(Color.BLACK)).hasSize(16);
        }

        @ParameterizedTest
        @CsvSource({
            "0, 0, WHITE, ROOK",  // a1
            "4, 0, WHITE, KING",  // e1
            "3, 0, WHITE, QUEEN", // d1
            "0, 7, BLACK, ROOK",  // a8
            "4, 7, BLACK, KING",  // e8
            "3, 7, BLACK, QUEEN"  // d8
        })
        @DisplayName("Major pieces should be placed correctly according to standard rules")
        void shouldValidateMajorPiecePlacement(int file, int rank, Color color, PieceType type) {
            // Arrange
            Position pos = new Position(file, rank);

            // Act
            Optional<Piece> pieceOpt = board.getPiece(pos);

            // Assert
            assertThat(pieceOpt).isPresent().hasValueSatisfying(piece -> {
                assertThat(piece.getColor()).isEqualTo(color);
                assertThat(piece.getType()).isEqualTo(type);
            });
        }

        @Test
        @DisplayName("Pawn ranks should be completely filled for both colors")
        void shouldValidatePawnRanks() {
            // Act & Assert
            for (int file = 0; file < 8; file++) {
                assertThat(board.getPiece(new Position(file, 1)))
                    .as("Rank 2 should only contain White Pawns")
                    .isPresent()
                    .get().extracting(Piece::getType).isEqualTo(PieceType.PAWN);

                assertThat(board.getPiece(new Position(file, 6)))
                    .as("Rank 7 should only contain Black Pawns")
                    .isPresent()
                    .get().extracting(Piece::getType).isEqualTo(PieceType.PAWN);
            }
        }
    }

    @Nested
    @DisplayName("Deep Copy & Memory Management")
    class DataManipulationTests {

        @Test
        @DisplayName("Should perform a deep copy where board and pieces are distinct instances")
        void shouldEnsureDeepCopyIntegrity() {
            // Arrange
            Board original = new Board(false);
            Position pos = new Position(4, 4);
            original.setPieceAt(pos, new Queen(Color.WHITE, pos));

            // Act
            Board copied = original.copy();

            // Assert
            assertNotSame(original, copied, "Board instances must be different");
            assertThat(copied.getPiece(pos)).isPresent();

            Piece originalPiece = original.getPiece(pos).orElseThrow();
            Piece copiedPiece = copied.getPiece(pos).orElseThrow();

            assertNotSame(originalPiece, copiedPiece, "Piece instances within the board must be different");
            assertThat(originalPiece).usingRecursiveComparison().isEqualTo(copiedPiece);
        }

        @Test
        @DisplayName("Pieces should synchronize their internal coordinates when moved on the board")
        void shouldSynchronizeInternalPosition() {
            // Arrange
            board.clearBoard();
            Position targetPos = new Position(4, 4);
            Piece knight = new Knight(Color.WHITE, new Position(0, 0));

            // Act
            board.setPieceAt(targetPos, knight);

            // Assert
            assertThat(knight.getPosition())
                .as("Piece internal state must update to match board position")
                .isEqualTo(targetPos);
        }
    }

    @Nested
    @DisplayName("Utility & Querying")
    class UtilityTests {

        @Test
        @DisplayName("Should locate the King of a specific color correctly")
        void shouldFindKingInstance() {
            // Arrange

            // Act
            Optional<King> whiteKing = board.findKing(Color.WHITE)
                .map(King.class::cast);

            // Assert
            assertThat(whiteKing)
                .as("White king should be present and instance of King class")
                .isPresent()
                .hasValueSatisfying(king -> {
                    assertThat(king.getType()).isEqualTo(PieceType.KING);
                    assertThat(king.getColor()).isEqualTo(Color.WHITE);
                });
        }
    }
}
