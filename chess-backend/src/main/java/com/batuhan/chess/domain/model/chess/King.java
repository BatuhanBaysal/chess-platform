package com.batuhan.chess.domain.model.chess;

import java.util.ArrayList;
import java.util.List;

public final class King extends Piece {

    public King(Color color, Position position) {
        super(color, PieceType.KING, position);
    }

    @Override
    public boolean isPseudoLegalMove(Position target, Board board) {
        int fileDiff = Math.abs(target.file() - position.file());
        int rankDiff = Math.abs(target.rank() - position.rank());

        if (fileDiff <= 1 && rankDiff <= 1 && (fileDiff != 0 || rankDiff != 0)) {
            return canCaptureOrMoveTo(target, board);
        }
        if (!hasMoved() && rankDiff == 0 && fileDiff == 2) {
            return true;
        }

        return false;
    }

    @Override
    public List<Position> getPseudoLegalMoves(Board board) {
        List<Position> moves = new ArrayList<>();

        int[] offsets = {-1, 0, 1};
        for (int fOff : offsets) {
            for (int rOff : offsets) {
                if (fOff == 0 && rOff == 0) continue;

                int newFile = position.file() + fOff;
                int newRank = position.rank() + rOff;

                if (newFile >= 0 && newFile < 8 && newRank >= 0 && newRank < 8) {
                    Position target = new Position(newFile, newRank);
                    if (isPseudoLegalMove(target, board)) {
                        moves.add(target);
                    }
                }
            }
        }

        if (!hasMoved()) {
            int currentFile = position.file();
            int currentRank = position.rank();

            if (currentFile + 2 < 8) {
                moves.add(new Position(currentFile + 2, currentRank));
            }
            if (currentFile - 2 >= 0) {
                moves.add(new Position(currentFile - 2, currentRank));
            }
        }

        return moves;
    }
}
