package com.batuhan.chess.domain.model;

/**
 * Represents the current state of a chess game.
 */
public enum GameStatus {
    /** Game is in progress and moves are being made. */
    ACTIVE,

    /** One of the kings is under direct attack by an opponent's piece. */
    CHECK,

    /** A player's king is in check and there is no way to get out of it. Game Over. */
    CHECKMATE,

    /** The player to move has no legal moves and their king is NOT in check. Game is a draw. */
    STALEMATE,

    /** A player has conceded the game. */
    RESIGNED,

    /** The game has ended in a tie by agreement or other rules. */
    DRAW
}
