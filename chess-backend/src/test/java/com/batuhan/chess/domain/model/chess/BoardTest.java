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

@DisplayName("Board Domain Model Tests")
class BoardTest {

    private Board board;

    @BeforeEach
    void setUp() {
        board = new Board(true);
    }

    @Nested
    @DisplayName("Initialization & Placement")
    class InitializationTests {

        @Test
        @DisplayName("Should initialize 8x8 grid with 32 total pieces evenly split by color")
        void shouldInitializeStandardBoardCorrectly() {
            // Act & Assert
            assertThat(board.getSquares()).hasDimensions(8, 8);
            assertThat(board.findAllPieces()).hasSize(32);
            assertThat(board.findPiecesByColor(Color.WHITE)).hasSize(16);
            assertThat(board.findPiecesByColor(Color.BLACK)).hasSize(16);
        }

        @ParameterizedTest
        @CsvSource({
            "0, 0, WHITE, ROOK",
            "4, 0, WHITE, KING",
            "3, 0, WHITE, QUEEN",
            "0, 7, BLACK, ROOK",
            "4, 7, BLACK, KING",
            "3, 7, BLACK, QUEEN"
        })
        @DisplayName("Should position major pieces according to official rules")
        void shouldPositionMajorPiecesCorrectly(int file, int rank, Color color, PieceType type) {
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
        @DisplayName("Should fill second and seventh ranks completely with pawns")
        void shouldFillPawnRanksCorrectly() {
            // Act & Assert
            for (int file = 0; file < 8; file++) {
                assertThat(board.getPiece(new Position(file, 1)))
                    .isPresent()
                    .get().extracting(Piece::getType).isEqualTo(PieceType.PAWN);

                assertThat(board.getPiece(new Position(file, 6)))
                    .isPresent()
                    .get().extracting(Piece::getType).isEqualTo(PieceType.PAWN);
            }
        }
    }

    @Nested
    @DisplayName("State Mutation & Querying")
    class MutationTests {

        @Test
        @DisplayName("Should clear all pieces when clearBoard is executed")
        void shouldEmptyBoard_WhenClearBoardCalled() {
            // Act
            board.clearBoard();

            // Assert
            assertThat(board.findAllPieces()).isEmpty();
        }

        @Test
        @DisplayName("Should remove piece from square when removePiece is executed")
        void shouldRemovePiece_WhenSquareOccupied() {
            // Arrange
            Position e2 = new Position(4, 1);
            assertThat(board.getPiece(e2)).isPresent();

            // Act
            board.removePiece(e2);

            // Assert
            assertThat(board.getPiece(e2)).isEmpty();
        }

        @Test
        @DisplayName("Should synchronize piece internal coordinates when setPieceAt is executed")
        void shouldSynchronizeCoordinates_WhenSetPieceAtCalled() {
            // Arrange
            board.clearBoard();
            Position target = new Position(4, 4);
            Piece knight = new Knight(Color.WHITE, new Position(0, 0));

            // Act
            board.setPieceAt(target, knight);

            // Assert
            assertThat(knight.getPosition()).isEqualTo(target);
            assertThat(board.getPiece(target)).contains(knight);
        }

        @Test
        @DisplayName("Should generate ASCII string representation of current board state")
        void shouldGenerateStringRepresentation() {
            // Act
            String boardString = board.toString();

            // Assert
            assertThat(boardString)
                .isNotNull()
                .hasSize(64)
                .contains("rnbqkbnr")
                .contains("RNBQKBNR");
        }
    }

    @Nested
    @DisplayName("Cloning & Memory Isolation")
    class DeepCopyTests {

        @Test
        @DisplayName("Should produce completely independent board and piece copies on copy")
        void shouldIsolateInstances_WhenBoardIsCopied() {
            // Arrange
            Board original = new Board(false);
            Position pos = new Position(4, 4);
            original.setPieceAt(pos, new Queen(Color.WHITE, pos));

            // Act
            Board copied = original.copy();

            // Assert
            assertNotSame(original, copied);
            Piece originalPiece = original.getPiece(pos).orElseThrow();
            Piece copiedPiece = copied.getPiece(pos).orElseThrow();

            assertNotSame(originalPiece, copiedPiece);
            assertThat(originalPiece).usingRecursiveComparison().isEqualTo(copiedPiece);
        }

        @Test
        @DisplayName("Should find King instance correctly for specified color")
        void shouldLocateKing_WhenColorSpecified() {
            // Act
            Optional<Piece> whiteKing = board.findKing(Color.WHITE);

            // Assert
            assertThat(whiteKing)
                .isPresent()
                .hasValueSatisfying(k -> {
                    assertThat(k.getType()).isEqualTo(PieceType.KING);
                    assertThat(k.getColor()).isEqualTo(Color.WHITE);
                });
        }
    }
}
