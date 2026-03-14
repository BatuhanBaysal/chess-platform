package com.batuhan.chess.domain.model;;

public final class Queen extends Piece {

    public Queen(Color color, Position position) {
        super(color, PieceType.QUEEN, position);
    }

    /**
     * Validates Queen movement: can move any number of squares diagonally, horizontally, or vertically.
     * Combines the logic of both Rook and Bishop.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = target.file() - position.file();
        int rankDiff = target.rank() - position.rank();

        int absFileDiff = Math.abs(fileDiff);
        int absRankDiff = Math.abs(rankDiff);

        // 1. Geometry Check: Must be either diagonal, horizontal, or vertical
        boolean isDiagonal = (absFileDiff == absRankDiff && absFileDiff != 0);
        boolean isStraight = (fileDiff == 0 && rankDiff != 0) || (fileDiff != 0 && rankDiff == 0);

        if (!isDiagonal && !isStraight) {
            return false;
        }

        // 2. Path Blocking Check
        // Determine steps: 1, -1, or 0
        int fileStep = Integer.compare(fileDiff, 0);
        int rankStep = Integer.compare(rankDiff, 0);

        int currentFile = position.file() + fileStep;
        int currentRank = position.rank() + rankStep;

        // Scan the path from current position to target
        while (currentFile != target.file() || currentRank != target.rank()) {
            if (board.getPiece(new Position(currentFile, currentRank)).isPresent()) {
                return false;
            }
            currentFile += fileStep;
            currentRank += rankStep;
        }

        // 3. Target Square Check: Must be empty or contain an enemy
        return board.getPiece(target)
            .map(targetPiece -> targetPiece.getColor() != this.color)
            .orElse(true);
    }
}
