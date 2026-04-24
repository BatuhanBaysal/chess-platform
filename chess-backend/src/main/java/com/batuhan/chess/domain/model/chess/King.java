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

        boolean isStandardMove = fileDiff <= 1 && rankDiff <= 1 && (fileDiff != 0 || rankDiff != 0);
        boolean isCastlingAttempt = !hasMoved() && rankDiff == 0 && fileDiff == 2;

        return (isStandardMove && canCaptureOrMoveTo(target, board)) || isCastlingAttempt;
    }

    @Override
    public List<Position> getPseudoLegalMoves(Board board) {
        List<Position> moves = new ArrayList<>();
        addStandardMoves(moves, board);

        if (!hasMoved()) {
            addCastlingPositions(moves);
        }

        return moves;
    }

    private void addStandardMoves(List<Position> moves, Board board) {
        int[] offsets = {-1, 0, 1};
        for (int fOff : offsets) {
            for (int rOff : offsets) {
                processOffset(moves, board, fOff, rOff);
            }
        }
    }

    private void processOffset(List<Position> moves, Board board, int fOff, int rOff) {
        if (fOff == 0 && rOff == 0) return;

        int newFile = position.file() + fOff;
        int newRank = position.rank() + rOff;

        if (Position.isValidPosition(newFile, newRank)) {
            Position target = new Position(newFile, newRank);
            if (isPseudoLegalMove(target, board)) {
                moves.add(target);
            }
        }
    }

    private void addCastlingPositions(List<Position> moves) {
        int currentFile = position.file();
        int currentRank = position.rank();

        if (Position.isValidPosition(currentFile + 2, currentRank)) {
            moves.add(new Position(currentFile + 2, currentRank));
        }
        if (Position.isValidPosition(currentFile - 2, currentRank)) {
            moves.add(new Position(currentFile - 2, currentRank));
        }
    }
}
