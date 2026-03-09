package com.batuhan.chess.domain.model;;

public final class Queen extends Piece {

    public Queen(Color color, Position position) {
        super(color, PieceType.QUEEN, position);
    }

    @Override
    public boolean isValidMove(Position targetPosition, Piece[][] board) {
        return false;
    }
}
