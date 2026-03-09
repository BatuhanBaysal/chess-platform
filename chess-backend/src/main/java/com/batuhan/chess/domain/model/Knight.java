package com.batuhan.chess.domain.model;

public final class Knight extends Piece{

    public Knight(Color color, Position position) {
        super(color, PieceType.KNIGHT, position);
    }

    @Override
    public boolean isValidMove(Position targetPosition, Piece[][] board) {
        return false;
    }
}
