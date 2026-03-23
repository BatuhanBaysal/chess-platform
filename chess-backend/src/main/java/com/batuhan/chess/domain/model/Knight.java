package com.batuhan.chess.domain.model;

/**
 * Represents a Knight piece.
 * Moves in an 'L' shape and has the unique ability to jump over other pieces.
 */
public final class Knight extends Piece {

    public Knight(Color color, Position position) {
        super(color, PieceType.KNIGHT, position);
    }

    /**
     * Validates the L-shaped move.
     * Since Knights jump over pieces, path clearance is not checked.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        // 1. Geometry: L-shape check (2x1 or 1x2)
        if (fileDiff * rankDiff != 2) {
            return false;
        }

        // 2. Target: Friendly fire check only
        return board.getPiece(target)
            .map(p -> p.getColor() != this.color)
            .orElse(true);
    }
}
