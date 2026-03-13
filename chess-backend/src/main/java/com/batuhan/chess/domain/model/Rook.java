package com.batuhan.chess.domain.model;

public final class Rook extends Piece {

    public Rook(Color color, Position position) {
        super(color, PieceType.ROOK, position);
    }

    /**
     * Validates Rook movement: must be horizontal or vertical.
     * Ensures no pieces block the path and the target square is not occupied by a friendly piece.
     */
    @Override
    public boolean isValidMove(Position target, Board board) {
        int fileDiff = target.file() - position.file();
        int rankDiff = target.rank() - position.rank();

        // 1. Geometry Check: Must move either horizontally or vertically, but not both or stay still
        boolean isHorizontal = (fileDiff != 0 && rankDiff == 0);
        boolean isVertical = (fileDiff == 0 && rankDiff != 0);

        if (!isHorizontal && !isVertical) {
            return false;
        }

        // Determine direction of movement (1, -1 or 0)
        int fileStep = Integer.compare(fileDiff, 0);
        int rankStep = Integer.compare(rankDiff, 0);

        int currentFile = position.file() + fileStep;
        int currentRank = position.rank() + rankStep;

        // 2. Path Blocking Check: Ensure all squares between start and target are empty
        while (currentFile != target.file() || currentRank != target.rank()) {
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
