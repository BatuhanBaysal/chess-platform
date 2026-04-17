package com.batuhan.chess.domain.model.chess;

import java.util.ArrayList;
import java.util.List;

public final class Knight extends Piece {

    public Knight(Color color, Position position) {
        super(color, PieceType.KNIGHT, position);
    }

    @Override
    public boolean isPseudoLegalMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        if (fileDiff * rankDiff != 2) {
            return false;
        }

        return canCaptureOrMoveTo(target, board);
    }

    @Override
    public List<Position> getPseudoLegalMoves(Board board) {
        List<Position> moves = new ArrayList<>();
        int[][] offsets = {
            {-2, -1}, {-2, 1}, {2, -1}, {2, 1},
            {-1, -2}, {-1, 2}, {1, -2}, {1, 2}
        };

        for (int[] o : offsets) {
            int newFile = position.file() + o[0];
            int newRank = position.rank() + o[1];

            if (newFile >= 0 && newFile < 8 && newRank >= 0 && newRank < 8) {
                Position target = new Position(newFile, newRank);
                if (isPseudoLegalMove(target, board)) {
                    moves.add(target);
                }
            }
        }
        return moves;
    }
}
