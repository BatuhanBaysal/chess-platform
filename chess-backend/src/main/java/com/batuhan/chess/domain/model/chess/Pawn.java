package com.batuhan.chess.domain.model.chess;

import java.util.ArrayList;
import java.util.List;

public final class Pawn extends Piece {

    public Pawn(Color color, Position position) {
        super(color, PieceType.PAWN, position);
    }

    @Override
    public boolean isPseudoLegalMove(Position target, Board board) {
        int fileDiff = target.file() - position.file();
        int rankDiff = target.rank() - position.rank();
        int direction = (color == Color.WHITE) ? 1 : -1;
        int startRank = (color == Color.WHITE) ? 1 : 6;

        if (fileDiff == 0) {
            if (rankDiff == direction) {
                return board.getPiece(target).isEmpty();
            }
            if (rankDiff == 2 * direction && position.rank() == startRank) {
                Position stepOver = new Position(position.file(), position.rank() + direction);
                return board.getPiece(target).isEmpty() && board.getPiece(stepOver).isEmpty();
            }
        }

        if (Math.abs(fileDiff) == 1 && rankDiff == direction) {
            return board.getPiece(target)
                .map(p -> p.getColor() != this.color)
                .orElse(false);
        }

        return false;
    }

    @Override
    public List<Position> getPseudoLegalMoves(Board board) {
        List<Position> moves = new ArrayList<>();
        int direction = (color == Color.WHITE) ? 1 : -1;

        int[] fileOffsets = {0, -1, 1};
        int[] rankOffsets = {direction, 2 * direction};

        for (int fOff : fileOffsets) {
            for (int rOff : rankOffsets) {
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
        return moves;
    }
}
