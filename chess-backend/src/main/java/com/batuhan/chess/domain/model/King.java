package com.batuhan.chess.domain.model;

public final class King extends Piece {

    public King(Color color, Position position) {
        super(color, PieceType.KING, position);
    }

    /**
     * Validates King movement: can move exactly one square in any direction.
     * Note: Castling logic will be implemented in the Game/Move service later.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        // 1. Geometry Check: Must move exactly 1 square in any direction
        // A move is valid if the maximum difference between files or ranks is 1
        if (fileDiff > 1 || rankDiff > 1 || (fileDiff == 0 && rankDiff == 0)) {
            return false;
        }

        // 2. Target Square Check: Must be empty or contain an enemy piece
        return board.getPiece(target)
            .map(targetPiece -> targetPiece.getColor() != this.color)
            .orElse(true);
    }
}
