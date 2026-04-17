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

        boolean isDiagonal = (fileDiff == rankDiff && fileDiff != 0);
        boolean isStraight = (fileDiff == 0 && rankDiff != 0) || (fileDiff != 0 && rankDiff == 0);

        if (!isDiagonal && !isStraight) {
            return false;
        }

        if (!isPathClear(target, board)) {
            return false;
        }

        return canCaptureOrMoveTo(target, board);
    }

    @Override
    public List<Position> getPseudoLegalMoves(Board board) {
        List<Position> moves = new ArrayList<>();
        int[][] directions = {
            {1, 1}, {1, -1}, {-1, 1}, {-1, -1},
            {1, 0}, {-1, 0}, {0, 1}, {0, -1}
        };

        for (int[] d : directions) {
            for (int i = 1; i < 8; i++) {
                int newFile = position.file() + (d[0] * i);
                int newRank = position.rank() + (d[1] * i);

                if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) break;

                Position target = new Position(newFile, newRank);
                if (isPseudoLegalMove(target, board)) {
                    moves.add(target);
                    if (board.getPiece(target).isPresent()) break;
                } else {
                    break;
                }
            }
        }
        return moves;
    }
}
