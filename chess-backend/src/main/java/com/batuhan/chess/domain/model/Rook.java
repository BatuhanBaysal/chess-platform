package com.batuhan.chess.domain.model;

public final class Rook extends Piece {

    public Rook(Color color, Position position) {
        super(color, PieceType.ROOK, position);
    }

    @Override
    public boolean isValidMove(Position targetPosition, Piece[][] board) {
        return false;
    }
}
