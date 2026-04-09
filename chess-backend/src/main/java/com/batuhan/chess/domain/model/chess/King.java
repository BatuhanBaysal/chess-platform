package com.batuhan.chess.domain.model.chess;

/**
 * Represents the King piece.
 * Moves one square in any direction. Also handles the geometric validation for Castling.
 */
public final class King extends Piece {

    public King(Color color, Position position) {
        super(color, PieceType.KING, position);
    }

    /**
     * Validates standard one-square moves and the initial two-square horizontal move for Castling.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        // 1. Standard Move: 1 square in any direction
        if (fileDiff <= 1 && rankDiff <= 1 && (fileDiff != 0 || rankDiff != 0)) {
            return board.getPiece(target)
                .map(p -> p.getColor() != this.color)
                .orElse(true);
        }

        // 2. Castling: 2 squares horizontally, provided the King hasn't moved yet
        // Path safety and check status are validated in the Game service
        if (fileDiff == 2 && rankDiff == 0 && !hasMoved) {
            return true;
        }

        return false;
    }
}
