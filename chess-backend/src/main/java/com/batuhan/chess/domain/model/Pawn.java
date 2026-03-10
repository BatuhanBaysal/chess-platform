package com.batuhan.chess.domain.model;

public final class Pawn extends Piece {

    public Pawn(Color color, Position position) {
        super(color, PieceType.PAWN, position);
    }

    /**
     * Validates the movement of a Pawn according to standard chess rules.
     * Includes 1-square forward move, initial 2-square jump, and diagonal capture.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = target.file() - position.file();
        int rankDiff = target.rank() - position.rank();

        // Determine movement direction and starting row based on color
        int direction = (color == Color.WHITE) ? 1 : -1;
        int startRank = (color == Color.WHITE) ? 1 : 6;

        // 1. Standard Forward Move (1 Square)
        // Must be in the same file, move one square forward, and the target must be empty
        if (fileDiff == 0 && rankDiff == direction) {
            return board.getPiece(target).isEmpty();
        }

        // 2. Initial Double Square Jump (2 Squares)
        // Must be from starting rank, move two squares forward,
        // and both the target and the square in between must be empty
        if (fileDiff == 0 && rankDiff == 2 * direction && position.rank() == startRank) {
            Position squareInBetween = new Position(position.file(), position.rank() + direction);
            return board.getPiece(target).isEmpty() && board.getPiece(squareInBetween).isEmpty();
        }

        // 3. Diagonal Capture
        // Must move one square forward and one square horizontally
        // There must be an opponent's piece at the target position
        if (Math.abs(fileDiff) == 1 && rankDiff == direction) {
            return board.getPiece(target)
                .map(targetPiece -> targetPiece.getColor() != this.color)
                .orElse(false);
        }

        return false;
    }
}
