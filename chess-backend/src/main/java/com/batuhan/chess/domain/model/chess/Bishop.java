package com.batuhan.chess.domain.model.chess;

/**
 * Represents a Bishop piece.
 * Moves diagonally across any number of vacant squares.
 */
public final class Bishop extends Piece {

    public Bishop(Color color, Position position) {
        super(color, PieceType.BISHOP, position);
    }

    /**
     * Validates movement based on diagonal geometry, path clearance, and target square occupancy.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        // 1. Geometry: Must be diagonal
        if (fileDiff != rankDiff || fileDiff == 0) return false;

        // 2. Path: Ensure no obstacles between current and target
        if (!isPathClear(target, board)) return false;

        // 3. Target: Can only capture opponent's pieces
        return board.getPiece(target)
            .map(p -> p.getColor() != this.color)
            .orElse(true);
    }
}
