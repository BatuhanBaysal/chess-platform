package com.batuhan.chess.domain.model;

public final class Knight extends Piece {

    public Knight(Color color, Position position) {
        super(color, PieceType.KNIGHT, position);
    }

    /**
     * Validates Knight movement: must be an L-shape (2 squares in one direction, 1 in the other).
     * Knights can jump over other pieces, so only the target square is checked.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        // 1. L-Shape Move Check
        // The L-shape means one difference is 2 and the other is 1.
        // Product of differences must be 2.
        if (fileDiff * rankDiff != 2) {
            return false;
        }

        // 2. Target Square Check
        // Knight can jump over pieces, so we only care about the target square.
        // It must be either empty or occupied by an enemy piece.
        return board.getPiece(target)
            .map(targetPiece -> targetPiece.getColor() != this.color)
            .orElse(true);
    }
}
