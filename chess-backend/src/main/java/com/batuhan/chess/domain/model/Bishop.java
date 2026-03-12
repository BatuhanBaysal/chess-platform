package com.batuhan.chess.domain.model;

public final class Bishop extends Piece {

    public Bishop(Color color, Position position) {
        super(color, PieceType.BISHOP, position);
    }

    /**
     * Validates Bishop movement: must be diagonal.
     * Ensures no pieces block the diagonal path and target square is not friendly.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = target.file() - position.file();
        int rankDiff = target.rank() - position.rank();

        // 1. Geometry Check: Must move diagonally (absolute difference must be equal)
        if (Math.abs(fileDiff) != Math.abs(rankDiff) || fileDiff == 0) {
            return false;
        }

        // Determine direction of movement (+1 or -1)
        int fileStep = fileDiff > 0 ? 1 : -1;
        int rankStep = rankDiff > 0 ? 1 : -1;

        int currentFile = position.file() + fileStep;
        int currentRank = position.rank() + rankStep;

        // 2. Path Blocking Check: Ensure all squares between start and target are empty
        while (currentFile != target.file()) {
            if (board.getPiece(new Position(currentFile, currentRank)).isPresent()) {
                return false;
            }
            currentFile += fileStep;
            currentRank += rankStep;
        }

        // 3. Target Check: Square must be empty or contain an enemy piece
        return board.getPiece(target)
            .map(targetPiece -> targetPiece.getColor() != this.color)
            .orElse(true);
    }
}
