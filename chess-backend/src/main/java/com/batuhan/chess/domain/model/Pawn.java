package com.batuhan.chess.domain.model;

public final class Pawn extends Piece {

    public Pawn(Color color, Position position) {
        super(color, PieceType.PAWN, position);
    }

    @Override
    public boolean isValidMove(Position targetPosition, Piece[][] board) {
        return false;
    }
}
