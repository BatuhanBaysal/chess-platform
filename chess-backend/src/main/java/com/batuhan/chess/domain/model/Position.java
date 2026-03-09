package com.batuhan.chess.domain.model;

/**
 * Represents a specific coordinate on an 8x8 chess board.
 * Uses 0-based indexing for internal logic (0-7).
 * * @param file The horizontal axis (a-h mapping to 0-7).
 * @param rank The vertical axis (1-8 mapping to 0-7).
 */
public record Position(int file, int rank) {

    /**
     * Compact constructor ensures that every Position object created
     * in the system is within the valid board boundaries.
     */
    public Position {
        if (file < 0 || file > 7 || rank < 0 || rank > 7) {
            throw new IllegalArgumentException(
                String.format("Invalid chess position: [%d, %d]. Must be between 0 and 7.")
            );
        }
    }

    /**
     * Utility method to check if coordinates are within the board limits
     * without instantiating a new Position object.
     */
    public static boolean isValidPosition(int file, int rank) {
        return file >= 0 && file <= 7 && rank >= 0 && rank <= 7;
    }
}
