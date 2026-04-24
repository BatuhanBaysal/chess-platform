package com.batuhan.chess.domain.model.chess;

import jakarta.validation.constraints.NotNull;

public record Position(int file, int rank) {

    public Position {
        if (!isValidPosition(file, rank)) {
            throw new IllegalArgumentException(
                String.format("Invalid position: [%d, %d]. Must be 0-7.", file, rank)
            );
        }
    }

    public static boolean isValidPosition(int file, int rank) {
        return file >= 0 && file <= 7 && rank >= 0 && rank <= 7;
    }

    @Override
    @NotNull
    public String toString() {
        return String.format("%c%d", (char) ('a' + file), rank + 1);
    }
}
