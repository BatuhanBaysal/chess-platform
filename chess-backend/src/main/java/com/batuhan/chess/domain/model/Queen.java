package com.batuhan.chess.domain.model;

/**
 * Represents the Queen piece.
 * Combines the movement of a Rook and a Bishop, moving any number of squares
 * horizontally, vertically, or diagonally.
 */
public final class Queen extends Piece {

    public Queen(Color color, Position position) {
        super(color, PieceType.QUEEN, position);
    }

    /**
     * Validates movement by checking horizontal, vertical, and diagonal geometry
     * and ensuring the path is clear.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        // 1. Geometry: Must be diagonal (diffs equal) or straight (one diff is zero)
        boolean isDiagonal = (fileDiff == rankDiff && fileDiff != 0);
        boolean isStraight = (fileDiff == 0 && rankDiff != 0) || (fileDiff != 0 && rankDiff == 0);

        if (!isDiagonal && !isStraight) {
            return false;
        }

        // 2. Path: Utilize common logic from parent Piece class
        if (!isPathClear(target, board)) {
            return false;
        }

        // 3. Target: Friendly fire check
        return board.getPiece(target)
            .map(p -> p.getColor() != this.color)
            .orElse(true);
    }
}
