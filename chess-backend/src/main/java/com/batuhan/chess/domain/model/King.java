package com.batuhan.chess.domain.model;

public final class King extends Piece {

    public King(Color color, Position position) {
        super(color, PieceType.KING, position);
    }

    /**
     * Validates King movement.
     * Supports standard one-square moves and the two-square horizontal movement for castling.
     * * @param target The destination position.
     * @param board The current state of the chess board.
     * @return true if the move is geometrically valid for a King.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        // Standard move: 1 square in any direction
        if (fileDiff <= 1 && rankDiff <= 1 && (fileDiff != 0 || rankDiff != 0)) {
            return board.getPiece(target)
                .map(targetPiece -> targetPiece.getColor() != this.color)
                .orElse(true);
        }

        // Castling move: 2 squares horizontally
        // Further validation (path safety, check status) is handled by the Game service.
        if (fileDiff == 2 && rankDiff == 0) {
            return !hasMoved;
        }

        return false;
    }
}
