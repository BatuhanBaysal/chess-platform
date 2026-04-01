package com.batuhan.chess.identity.domain.model;

/**
 * Represents a Pawn piece.
 * Moves forward but captures diagonally. Handles initial double-step move.
 */
public final class Pawn extends Piece {

    public Pawn(Color color, Position position) {
        super(color, PieceType.PAWN, position);
    }

    /**
     * Validates forward moves (1 or 2 squares) and diagonal captures.
     * En Passant and Promotion logic is handled at the Game level.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = target.file() - position.file();
        int rankDiff = target.rank() - position.rank();

        int direction = (color == Color.WHITE) ? 1 : -1;
        int startRank = (color == Color.WHITE) ? 1 : 6;

        // 1. Standard Forward Move
        if (fileDiff == 0 && rankDiff == direction) {
            return board.getPiece(target).isEmpty();
        }

        // 2. Initial Double Step
        if (fileDiff == 0 && rankDiff == 2 * direction && position.rank() == startRank) {
            Position stepOver = new Position(position.file(), position.rank() + direction);
            return board.getPiece(target).isEmpty() && board.getPiece(stepOver).isEmpty();
        }

        // 3. Diagonal Capture
        if (Math.abs(fileDiff) == 1 && rankDiff == direction) {
            return board.getPiece(target)
                .map(p -> p.getColor() != this.color)
                .orElse(false);
        }

        return false;
    }
}
