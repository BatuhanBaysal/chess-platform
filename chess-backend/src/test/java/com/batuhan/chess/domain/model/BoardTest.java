package com.batuhan.chess.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

public class BoardTest {

    private Board board;

    @BeforeEach
    public void setUp() {
        // Professional Approach: Default constructor initializes the standard starting position.
        board = new Board();
    }

    @Test
    @DisplayName("The board should be constructed correctly with 8x8 dimensions.")
    void boardShouldBeEightByEight() {
        // Act & Assert
        assertThat(board.getSquares()).hasDimensions(8, 8);
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
    @DisplayName("Major pieces should be in their correct starting positions.")
    void majorPiecesShouldBeInCorrectPositions(int file, int rank, Color color, PieceType type) {
        // Act
        var pieceOptional = board.getPiece(new Position(file, rank));

        // Assert
        assertThat(pieceOptional).isPresent();
        assertThat(pieceOptional.get().getColor()).isEqualTo(color);
        assertThat(pieceOptional.get().getType()).isEqualTo(type);
    }

    @Test
    @DisplayName("Pawn rows (ranks 1 and 6) must be completely filled with correct colors.")
    void pawnLinesShouldBeCorrect() {
        // Act & Assert
        for (int file = 0; file < 8; file++) {
            // White pawns on rank 1
            var whitePawn = board.getPiece(new Position(file, 1));
            assertThat(whitePawn).isPresent();
            assertThat(whitePawn.get().getType()).isEqualTo(PieceType.PAWN);
            assertThat(whitePawn.get().getColor()).isEqualTo(Color.WHITE);

            // Black pawns on rank 6
            var blackPawn = board.getPiece(new Position(file, 6));
            assertThat(blackPawn).isPresent();
            assertThat(blackPawn.get().getType()).isEqualTo(PieceType.PAWN);
            assertThat(blackPawn.get().getColor()).isEqualTo(Color.BLACK);
        }
    }

    @ParameterizedTest
    @CsvSource({
        "4, 3", // e4
        "3, 4", // d5
        "0, 2", // a3
        "7, 5"  // h6
    })
    @DisplayName("Middle squares must be empty at the start of the game.")
    void middleSquaresShouldBeEmpty(int file, int rank) {
        // Act & Assert
        assertThat(board.getPiece(new Position(file, rank))).isEmpty();
    }

    @Test
    @DisplayName("A piece should update its internal position when placed on the board.")
    void pieceShouldTrackItsOwnPosition() {
        // Arrange
        // Create a piece with an initial position, then place it elsewhere on the board
        Position initialPos = new Position(0, 0);
        Position boardPos = new Position(4, 4); // e5
        Piece knight = new Knight(Color.WHITE, initialPos);

        // Act
        board.setPieceAt(boardPos, knight);

        // Assert: The board must update the piece's internal position to match boardPos
        assertThat(knight.getPosition()).isEqualTo(boardPos);
    }
}
