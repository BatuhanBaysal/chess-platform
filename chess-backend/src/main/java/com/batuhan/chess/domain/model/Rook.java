package com.batuhan.chess.domain.model;

/**
 * Represents a Rook piece.
 * Moves any number of squares horizontally or vertically.
 */
public final class Rook extends Piece {

    public Rook(Color color, Position position) {
        super(color, PieceType.ROOK, position);
    }

    /**
     * Validates movement along ranks and files, ensuring a clear path
     * and a non-friendly target square.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        // 1. Geometry: Must move horizontally or vertically, but not both
        boolean isHorizontal = (fileDiff != 0 && rankDiff == 0);
        boolean isVertical = (fileDiff == 0 && rankDiff != 0);

        if (!isHorizontal && !isVertical) {
            return false;
        }

        // 2. Path: Utilize common logic to scan for obstacles
        if (!isPathClear(target, board)) {
            return false;
        }

        // 3. Target: Cannot capture own color
        return board.getPiece(target)
            .map(p -> p.getColor() != this.color)
            .orElse(true);
    }
}
