package com.batuhan.chess.domain.model.chess;

public enum GameStatus {
    ACTIVE,
    CHECK,
    CHECKMATE,
    STALEMATE,
    RESIGNED,
    TIMEOUT,
    DRAW,
    CLOSING;

    public boolean isFinished() {
        return this == CHECKMATE || this == STALEMATE ||
            this == RESIGNED || this == TIMEOUT || this == DRAW || this == CLOSING;
    }
}
