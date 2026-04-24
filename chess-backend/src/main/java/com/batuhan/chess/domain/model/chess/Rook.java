package com.batuhan.chess.domain.model.chess;

import java.util.ArrayList;
import java.util.List;

public final class Rook extends Piece {
    public Rook(Color color, Position position) {
        super(color, PieceType.ROOK, position);
    }

    @Override
    public boolean isPseudoLegalMove(Position target, Board board) {
        boolean isStraight = position.file() == target.file() || position.rank() == target.rank();

        return isStraight
            && isPathClear(target, board)
            && canCaptureOrMoveTo(target, board);
    }

    @Override
    public List<Position> getPseudoLegalMoves(Board board) {
        List<Position> moves = new ArrayList<>();
        int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        for (int[] d : directions) {
            addMovesInDirection(moves, d, board);
        }
        return moves;
    }
}
