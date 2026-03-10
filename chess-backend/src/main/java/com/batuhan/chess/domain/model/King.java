package com.batuhan.chess.domain.model;

public final class King extends Piece {

    public King(Color color, Position position) {
        super(color, PieceType.KING, position);
    }

    @Override
    public boolean isValidMove(Position target, Board board) {
        return false;
    }
}
