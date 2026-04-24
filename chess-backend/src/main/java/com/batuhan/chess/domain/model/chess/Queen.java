package com.batuhan.chess.domain.model.chess;

import java.util.ArrayList;
import java.util.List;

public final class Queen extends Piece {
    public Queen(Color color, Position position) {
        super(color, PieceType.QUEEN, position);
    }

    @Override
    public boolean isPseudoLegalMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        boolean isDiagonal = fileDiff == rankDiff;
        boolean isStraight = position.file() == target.file() || position.rank() == target.rank();

        return (isDiagonal || isStraight)
            && isPathClear(target, board)
            && canCaptureOrMoveTo(target, board);
    }

    @Override
    public List<Position> getPseudoLegalMoves(Board board) {
        List<Position> moves = new ArrayList<>();
        int[][] directions = {
            {1, 1}, {1, -1}, {-1, 1}, {-1, -1},
            {1, 0}, {-1, 0}, {0, 1}, {0, -1}
        };

        for (int[] d : directions) {
            addMovesInDirection(moves, d, board);
        }
        return moves;
    }
}
