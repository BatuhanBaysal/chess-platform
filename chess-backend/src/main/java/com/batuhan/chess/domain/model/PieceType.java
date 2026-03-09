package com.batuhan.chess.domain.model;

/**
 * Represents the type and initial character notation of a chess piece.
 */
public enum PieceType {
    PAWN('P'),
    KNIGHT('N'),
    BISHOP('B'),
    ROOK('R'),
    QUEEN('Q'),
    KING('K');

    private final char symbol;

    PieceType(char symbol) {
        this.symbol = symbol;
    }

    /**
     * @return The standard algebraic notation character for the piece.
     */
    public char getSymbol() {
        return symbol;
    }
}
