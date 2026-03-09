package com.batuhan.chess.domain.model;

public final class Bishop extends Piece{

    public Bishop(Color color, Position position) {
        super(color, PieceType.BISHOP, position);
    }

    @Override
    public boolean isValidMove(Position targetPosition, Piece[][] board) {
        return false;
    }
}
