package com.batuhan.chess.domain.model;

/**
 * Defines the sides in a chess game.
 */
public enum Color {
    WHITE,
    BLACK;

    /**
     * @return The opposite color of the current instance.
     * Useful for switching turns or identifying opponent pieces.
     */
    public Color opposite() {
        return this == WHITE ? BLACK : WHITE;
    }
}
