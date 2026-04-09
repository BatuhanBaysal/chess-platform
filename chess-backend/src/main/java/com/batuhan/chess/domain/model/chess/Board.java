package com.batuhan.chess.domain.model.chess;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Represents the 8x8 chess board.
 * Manages piece placement, board initialization, and state retrieval.
 */
public class Board {

    private final Piece[][] squares;

    public Board(boolean fillBoard) {
        this.squares = new Piece[8][8];
        if (fillBoard) {
            initializeBoard();
        }
    }

    public Board() {
        this(true);
    }

    /**
     * Retrieves a piece at a given position.
     * Returns Optional.empty if the square is vacant or out of bounds.
     */
    public Optional<Piece> getPiece(Position position) {
        if (isOutOfBounds(position)) {
            return Optional.empty();
        }
        return Optional.ofNullable(squares[position.rank()][position.file()]);
    }

    public void setPieceAt(Position position, Piece piece) {
        if (isOutOfBounds(position)) return;

        squares[position.rank()][position.file()] = piece;
        if (piece != null) {
            piece.setPosition(position);
        }
    }

    public List<Piece> findAllPieces() {
        List<Piece> allPieces = new ArrayList<>();
        for (int r = 0; r < 8; r++) {
            for (int f = 0; f < 8; f++) {
                Piece piece = squares[r][f];
                if (piece != null) {
                    allPieces.add(piece);
                }
            }
        }
        return allPieces;
    }

    public void clearBoard() {
        for (int r = 0; r < 8; r++) {
            for (int f = 0; f < 8; f++) {
                squares[r][f] = null;
            }
        }
    }

    private boolean isOutOfBounds(Position pos) {
        return pos.file() < 0 || pos.file() > 7 || pos.rank() < 0 || pos.rank() > 7;
    }

    public Piece[][] getSquares() {
        return squares;
    }

    /**
     * Serializes the board state into a string format.
     * Used for history tracking and threefold repetition checks.
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder(64);
        for (int r = 7; r >= 0; r--) {
            for (int f = 0; f < 8; f++) {
                Piece p = squares[r][f];
                if (p == null) {
                    sb.append('.');
                    continue;
                }

                char typeChar = (p.getType() == PieceType.KNIGHT) ? 'N' : p.getType().name().charAt(0);
                sb.append(p.getColor() == Color.WHITE
                    ? Character.toUpperCase(typeChar)
                    : Character.toLowerCase(typeChar));
            }
        }
        return sb.toString();
    }

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
