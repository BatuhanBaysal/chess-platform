package com.batuhan.chess.domain.model;

/**
 * Represents a generic chess piece.
 * Sealed class hierarchy ensures that only authorized pieces exist.
 */
public abstract sealed class Piece
    permits Pawn, Knight, Bishop, Rook, Queen, King {

    protected final Color color;
    protected final PieceType type;
    protected Position position;

    protected Piece(Color color, PieceType type, Position position) {
        this.color = color;
        this.type = type;
        this.position = position;
    }

    public Color getColor() {
        return color;
    }

    public PieceType getType() {
        return type;
    }

    public Position getPosition() {
        return position;
    }

    /**
     * Updates the position of the piece after a move.
     */
    public void setPosition(Position position) {
        this.position = position;
    }

    /**
     * Logic to determine if a move is valid for this specific piece.
     * To be implemented by each subclass according to chess rules.
     */
    public abstract boolean isValidMove(Position targetPosition, Board board);
}
