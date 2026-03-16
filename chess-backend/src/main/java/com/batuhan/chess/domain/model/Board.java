package com.batuhan.chess.domain.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Represents the 8x8 chess board domain entity.
 * Responsible for managing piece placement and maintaining the integrity of the board state.
 */
public class Board {
    private final Piece[][] squares;

    /**
     * Constructs a board with the option to initialize pieces.
     * * @param fillBoard If true, populates the board with the standard chess starting position.
     * If false, creates an empty board, useful for unit testing.
     */
    public Board(boolean fillBoard) {
        this.squares = new Piece[8][8];
        if (fillBoard) {
            initializeBoard();
        }
    }

    /**
     * Default constructor.
     * Creates a standard board and initializes it with all pieces in their starting positions.
     */
    public Board() {
        this(true);
    }

    /**
     * Retrieves a piece at a given position.
     * @param position The coordinates to check.
     * @return An Optional containing the piece if present, otherwise empty.
     */
    public Optional<Piece> getPiece(Position position) {
        Piece piece = squares[position.file()][position.rank()];
        return Optional.ofNullable(piece);
    }

    /**
     * Places a piece at the specified position and updates the piece's internal state.
     * @param position The target coordinates.
     * @param piece The piece to place (can be null to clear the square).
     */
    public void setPieceAt(Position position, Piece piece) {
        squares[position.file()][position.rank()] = piece;
        if (piece != null) {
            piece.setPosition(position);
        }
    }

    /**
     * Scans the entire board and returns a list of all active pieces.
     * @return A list containing all pieces currently on the board.
     */
    public List<Piece> findAllPieces() {
        List<Piece> allPieces = new ArrayList<>();
        for (int file = 0; file < 8; file++) {
            for (int rank = 0; rank < 8; rank++) {
                Piece piece = squares[file][rank];
                if (piece != null) {
                    allPieces.add(piece);
                }
            }
        }
        return allPieces;
    }

    /**
     * Removes all pieces from the board.
     * Primarily used for setting up custom scenarios in unit tests.
     */
    public void clearBoard() {
        for (int f = 0; f < 8; f++) {
            for (int r = 0; r < 8; r++) {
                squares[f][r] = null;
            }
        }
    }

    /**
     * Provides access to the raw square matrix.
     * @return 2D array of pieces.
     */
    public Piece[][] getSquares() {
        return squares;
    }

    // --- Private Helper Methods for Initialization ---
    private void initializeBoard() {
        setupMajorPieces(Color.BLACK, 7);
        setupMajorPieces(Color.WHITE, 0);

        setupPawns(Color.BLACK, 6);
        setupPawns(Color.WHITE, 1);
    }

    private void setupMajorPieces(Color color, int rank) {
        setPieceAt(new Position(0, rank), new Rook(color, new Position(0, rank)));
        setPieceAt(new Position(1, rank), new Knight(color, new Position(1, rank)));
        setPieceAt(new Position(2, rank), new Bishop(color, new Position(2, rank)));
        setPieceAt(new Position(3, rank), new Queen(color, new Position(3, rank)));
        setPieceAt(new Position(4, rank), new King(color, new Position(4, rank)));
        setPieceAt(new Position(5, rank), new Bishop(color, new Position(5, rank)));
        setPieceAt(new Position(6, rank), new Knight(color, new Position(6, rank)));
        setPieceAt(new Position(7, rank), new Rook(color, new Position(7, rank)));
    }

    private void setupPawns(Color color, int rank) {
        for (int file = 0; file < 8; file++) {
            setPieceAt(new Position(file, rank), new Pawn(color, new Position(file, rank)));
        }
    }
}
